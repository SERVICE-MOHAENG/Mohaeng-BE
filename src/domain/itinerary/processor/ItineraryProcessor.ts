import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { RoadmapSurvey } from '../../course/entity/RoadmapSurvey.entity';

interface ItineraryJobData {
  jobId: string;
  surveyId: string;
}

/**
 * ItineraryProcessor
 * @description
 * - BullMQ Worker: 큐에서 작업을 꺼내 Python LLM 서버에 생성 요청
 * - 재시도: 3회, 지수 백오프 (5s, 10s, 20s)
 */
@Processor('itinerary-generation')
export class ItineraryProcessor extends WorkerHost {
  private readonly logger = new Logger(ItineraryProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly itineraryJobRepository: ItineraryJobRepository,
    @InjectRepository(RoadmapSurvey)
    private readonly surveyRepository: Repository<RoadmapSurvey>,
  ) {
    super();
  }

  async process(job: Job<ItineraryJobData>): Promise<void> {
    const { jobId, surveyId } = job.data;
    this.logger.log(`작업 처리 시작: jobId=${jobId}, surveyId=${surveyId}`);

    // 1. ItineraryJob 로드 및 PROCESSING 상태 변경
    const itineraryJob = await this.itineraryJobRepository.findById(jobId);
    if (!itineraryJob) {
      this.logger.error(`ItineraryJob not found: ${jobId}`);
      return;
    }

    itineraryJob.markProcessing();
    itineraryJob.incrementAttempt();
    await this.itineraryJobRepository.save(itineraryJob);

    // 2. RoadmapSurvey 로드 (with relations)
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['destinations', 'companions', 'themes'],
    });

    if (!survey) {
      this.logger.error(`RoadmapSurvey not found: ${surveyId}`);
      itineraryJob.markFailed('SURVEY_NOT_FOUND', '설문을 찾을 수 없습니다');
      await this.itineraryJobRepository.save(itineraryJob);
      return;
    }

    // 3. Python payload 구성
    const payload = this.buildPythonPayload(survey);
    const pythonBaseUrl = this.configService.get<string>('PYTHON_LLM_BASE_URL');
    const serviceSecret = this.configService.get<string>('SERVICE_SECRET');
    const callbackBaseUrl =
      this.configService.get<string>('CALLBACK_BASE_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || '8080'}`;
    const callbackUrl = `${callbackBaseUrl}/api/v1/itineraries/${jobId}/result`;

    // 4. Python LLM 서버 호출
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${pythonBaseUrl}/api/v1/generate`,
          {
            job_id: jobId,
            callback_url: callbackUrl,
            payload,
          },
          {
            headers: {
              'x-service-secret': serviceSecret,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          },
        ),
      );

      this.logger.log(
        `Python 서버 응답: status=${response.status}, jobId=${jobId}`,
      );
    } catch (error) {
      this.logger.error(
        `Python 서버 호출 실패: jobId=${jobId}, error=${error.message}`,
      );
      // throw하여 BullMQ가 자동 재시도하도록 함
      throw error;
    }
  }

  /**
   * Survey 데이터 → Python API payload 변환
   */
  private buildPythonPayload(survey: RoadmapSurvey) {
    const destinations = survey.destinations || [];

    // 전체 여행 시작/종료일 계산
    const startDates = destinations.map(
      (d) => new Date(d.startDay).getTime(),
    );
    const endDates = destinations.map(
      (d) => new Date(d.endDate).getTime(),
    );

    const globalStartDate =
      startDates.length > 0
        ? this.formatDate(new Date(Math.min(...startDates)))
        : '';
    const globalEndDate =
      endDates.length > 0
        ? this.formatDate(new Date(Math.max(...endDates)))
        : '';

    return {
      start_date: globalStartDate,
      end_date: globalEndDate,
      regions: destinations.map((d) => ({
        region: d.regionName,
        start_date: this.formatDate(new Date(d.startDay)),
        end_date: this.formatDate(new Date(d.endDate)),
      })),
      people_count: survey.paxCount,
      companion_type: survey.companions?.[0]?.companion ?? 'SOLO',
      travel_themes: (survey.themes || []).map((t) => t.theme),
      pace_preference: survey.pacePreference,
      planning_preference: survey.planningPreference,
      destination_preference: survey.destinationPreference,
      activity_preference: survey.activityPreference,
      priority_preference: survey.priorityPreference,
      budget_range: survey.budget,
      notes: survey.userNote ?? '',
    };
  }

  /**
   * Date → YYYY-MM-DD 문자열 변환
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
