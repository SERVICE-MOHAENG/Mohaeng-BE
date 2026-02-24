import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { UserPreference } from '../entity/UserPreference.entity';

export interface PreferenceJobData {
  jobId: string;
  preferenceId: string;
}

/**
 * PreferenceProcessor
 * @description
 * - BullMQ Worker: preference-recommendation 큐에서 작업을 꺼내
 *   Python LLM 서버 POST /api/v1/recommend 호출
 * - 재시도: 3회, 지수 백오프 (5s, 10s, 20s)
 */
@Processor('preference-recommendation')
export class PreferenceProcessor extends WorkerHost {
  private readonly logger = new Logger(PreferenceProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly preferenceJobRepository: PreferenceJobRepository,
    @InjectRepository(UserPreference)
    private readonly preferenceRepository: Repository<UserPreference>,
  ) {
    super();
  }

  async process(job: Job<PreferenceJobData>): Promise<void> {
    const { jobId, preferenceId } = job.data;
    this.logger.log(`추천 작업 처리 시작: jobId=${jobId}, preferenceId=${preferenceId}`);

    // 1. PreferenceJob PROCESSING 상태로 변경
    const preferenceJob = await this.preferenceJobRepository.findById(jobId);
    if (!preferenceJob) {
      this.logger.error(`PreferenceJob not found: ${jobId}`);
      return;
    }
    preferenceJob.markProcessing();
    await this.preferenceJobRepository.save(preferenceJob);

    // 2. UserPreference 로드 (with relations)
    const preference = await this.preferenceRepository.findOne({
      where: { id: preferenceId },
      relations: [
        'weatherPreferences',
        'travelRanges',
        'travelStyles',
        'foodPersonalities',
        'mainInterests',
        'budgets',
      ],
    });

    if (!preference) {
      this.logger.error(`UserPreference not found: ${preferenceId}`);
      preferenceJob.markFailed('PREFERENCE_NOT_FOUND', '선호도 데이터를 찾을 수 없습니다');
      await this.preferenceJobRepository.save(preferenceJob);
      return;
    }

    // 3. Python payload 구성 (기능 명세 포맷)
    const payload = this.buildPythonPayload(jobId, preference);
    const pythonBaseUrl = this.configService.get<string>('PYTHON_LLM_BASE_URL');
    const serviceSecret = this.configService.get<string>('SERVICE_SECRET');
    const callbackBaseUrl =
      this.configService.get<string>('CALLBACK_BASE_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || '8080'}`;
    const callbackUrl = `${callbackBaseUrl}/api/v1/preferences/jobs/${jobId}/result`;

    // 4. Python LLM 서버 호출 (POST /api/v1/recommend)
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${pythonBaseUrl}/api/v1/recommend`,
          {
            ...payload,
            callback_url: callbackUrl,
          },
          {
            headers: {
              'x-service-secret': serviceSecret,
              'Content-Type': 'application/json',
            },
            timeout: 5000, // 5초 연결 확인용
          },
        ),
      );
      this.logger.log(`Python 서버 응답: status=${response.status}, jobId=${jobId}`);
    } catch (error) {
      this.logger.error(`Python 서버 호출 실패: jobId=${jobId}, error=${error.message}`);
      throw error; // BullMQ 자동 재시도
    }
  }

  /**
   * UserPreference → Python API payload 변환
   * 기능 명세 포맷:
   * {
   *   job_id, callback_url,
   *   weather, travel_range, travel_style, budget_level  ← 단일값
   *   food_personality, main_interests                   ← 배열
   * }
   */
  private buildPythonPayload(jobId: string, preference: UserPreference) {
    return {
      job_id: jobId,
      weather: preference.weatherPreferences?.[0]?.weather ?? null,
      travel_range: preference.travelRanges?.[0]?.travelRange ?? null,
      travel_style: preference.travelStyles?.[0]?.travelStyle ?? null,
      budget_level: preference.budgets?.[0]?.budgetLevel ?? null,
      food_personality: preference.foodPersonalities?.map((f) => f.foodPersonality) ?? [],
      main_interests: preference.mainInterests?.map((i) => i.mainInterest) ?? [],
    };
  }
}
