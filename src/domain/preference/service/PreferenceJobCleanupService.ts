import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { PreferenceJobStatus } from '../entity/PreferenceJob.entity';

/**
 * PreferenceJobCleanupService
 * @description
 * - Stale Job 감지 크론잡
 * - 매 분마다 PROCESSING 상태에서 10분 초과된 Job을 FAILED 처리
 */
@Injectable()
export class PreferenceJobCleanupService {
  private readonly logger = new Logger(PreferenceJobCleanupService.name);
  private static readonly TIMEOUT_MINUTES = 10;

  constructor(
    private readonly preferenceJobRepository: PreferenceJobRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async detectStaleJobs(): Promise<void> {
    const staleJobs = await this.preferenceJobRepository.findStaleJobs(
      PreferenceJobCleanupService.TIMEOUT_MINUTES,
    );

    let processedCount = 0;
    let skippedCount = 0;

    for (const job of staleJobs) {
      // Race condition 방지: 최신 상태 재확인
      const currentJob = await this.preferenceJobRepository.findById(job.id);

      if (!currentJob) {
        this.logger.warn(`Job not found during cleanup: jobId=${job.id}`);
        continue;
      }

      // 이미 SUCCESS 또는 FAILED로 변경된 경우 스킵 (콜백이 먼저 처리됨)
      if (
        currentJob.status === PreferenceJobStatus.SUCCESS ||
        currentJob.status === PreferenceJobStatus.FAILED
      ) {
        this.logger.debug(
          `Job already completed with status ${currentJob.status}, skipping: jobId=${job.id}`,
        );
        skippedCount++;
        continue;
      }

      // 여전히 PROCESSING 상태인 경우에만 타임아웃 처리
      if (currentJob.status === PreferenceJobStatus.PROCESSING) {
        currentJob.markFailed(
          'JOB_TIMEOUT',
          '추천 작업 시간이 초과되었습니다 (10분)',
        );
        await this.preferenceJobRepository.save(currentJob);

        this.logger.warn(`Stale job 타임아웃 처리: jobId=${currentJob.id}`);
        processedCount++;
      }
    }

    if (processedCount > 0 || skippedCount > 0) {
      this.logger.log(
        `Stale job 처리 완료 - 타임아웃: ${processedCount}개, 스킵: ${skippedCount}개`,
      );
    }
  }
}
