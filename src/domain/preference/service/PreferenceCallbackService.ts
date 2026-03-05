import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { PreferenceRecommendation } from '../entity/PreferenceRecommendation.entity';
import { PreferenceJobStatus } from '../entity/PreferenceJob.entity';
import { RegionRepository } from '../../country/persistence/RegionRepository';

export interface PreferenceSuccessPayload {
  recommended_destinations: { region_name: string }[];
}

export interface PreferenceErrorPayload {
  code: string;
  message: string;
}

/**
 * PreferenceCallbackService
 * @description Python LLM 서버의 추천 결과 콜백 처리
 */
@Injectable()
export class PreferenceCallbackService {
  private readonly logger = new Logger(PreferenceCallbackService.name);

  constructor(
    private readonly preferenceJobRepository: PreferenceJobRepository,
    @InjectRepository(PreferenceRecommendation)
    private readonly recommendationRepository: Repository<PreferenceRecommendation>,
    private readonly regionRepository: RegionRepository,
  ) {}

  /**
   * 추천 성공 콜백 처리
   */
  async handleSuccess(
    jobId: string,
    payload: PreferenceSuccessPayload,
  ): Promise<void> {
    const job = await this.preferenceJobRepository.findById(jobId);
    if (!job) {
      this.logger.error(`PreferenceJob not found: ${jobId}`);
      return;
    }

    // 추천 결과 저장 (최대 5개) - Region DB 조회 후 FK 연결
    const recommendations = await Promise.all(
      payload.recommended_destinations.slice(0, 5).map(async (dest) => {
        const region = await this.regionRepository.findByName(dest.region_name);
        return PreferenceRecommendation.create(
          jobId,
          dest.region_name.slice(0, 100),
          region?.id,
        );
      }),
    );
    await this.recommendationRepository.save(recommendations);

    // Job 상태 SUCCESS 업데이트
    job.markSuccess();
    await this.preferenceJobRepository.save(job);

    this.logger.log(
      `추천 완료: jobId=${jobId}, destinations=${recommendations.map((r) => r.regionName).join(', ')}`,
    );
  }

  /**
   * 추천 실패 콜백 처리
   */
  async handleFailure(
    jobId: string,
    error: PreferenceErrorPayload,
  ): Promise<void> {
    const job = await this.preferenceJobRepository.findById(jobId);
    if (!job) {
      this.logger.error(`PreferenceJob not found: ${jobId}`);
      return;
    }

    // 이미 완료된 작업은 무시 (멱등성)
    if (
      job.status === PreferenceJobStatus.SUCCESS ||
      job.status === PreferenceJobStatus.FAILED
    ) {
      this.logger.warn(
        `Job ${jobId} 이미 ${job.status} 상태입니다. 콜백 무시.`,
      );
      return;
    }

    job.markFailed(error.code, error.message);
    await this.preferenceJobRepository.save(job);

    this.logger.warn(
      `추천 실패: jobId=${jobId}, code=${error.code}, message=${error.message}`,
    );
  }

  /**
   * Job 상태 조회
   */
  async getJobStatus(jobId: string): Promise<PreferenceJobStatus | null> {
    const job = await this.preferenceJobRepository.findById(jobId);
    return job?.status ?? null;
  }

  /**
   * 추천 결과 조회 (Region 정보 포함)
   */
  async getRecommendations(jobId: string): Promise<PreferenceRecommendation[]> {
    return this.recommendationRepository.find({
      where: { jobId },
      relations: ['region'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 사용자 ID로 최신 추천 결과 조회
   */
  async getRecommendationsByUserId(
    userId: string,
  ): Promise<PreferenceRecommendation[]> {
    const job = await this.preferenceJobRepository.findByUserId(userId);
    if (!job || job.status !== PreferenceJobStatus.SUCCESS) {
      return [];
    }
    return this.getRecommendations(job.id);
  }
}
