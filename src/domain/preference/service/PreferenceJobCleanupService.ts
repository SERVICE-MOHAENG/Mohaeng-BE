import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { PreferenceJobStatus } from '../entity/PreferenceJob.entity';
import { PreferenceJobData } from '../processor/PreferenceProcessor';

/**
 * PreferenceJobCleanupService
 * @description
 * - Stale Job 감지 크론잡
 * - 매 분마다 PROCESSING 상태에서 10분 초과된 Job을 감지
 * - retryCount < 1: PENDING 리셋 후 재enqueue
 * - retryCount >= 1: 최종 FAILED 처리
 */
@Injectable()
export class PreferenceJobCleanupService {
  private readonly logger = new Logger(PreferenceJobCleanupService.name);
  private static readonly TIMEOUT_MINUTES = 10;
  private static readonly MAX_RETRY_COUNT = 1;

  constructor(
    private readonly preferenceJobRepository: PreferenceJobRepository,
    @InjectQueue('preference-recommendation')
    private readonly preferenceQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async detectStaleJobs(): Promise<void> {
    const staleJobs = await this.preferenceJobRepository.findStaleJobs(
      PreferenceJobCleanupService.TIMEOUT_MINUTES,
    );

    let retriedCount = 0;
    let failedCount = 0;
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

      if (currentJob.status === PreferenceJobStatus.PROCESSING) {
        if (currentJob.retryCount < PreferenceJobCleanupService.MAX_RETRY_COUNT) {
          // 1회 재시도: PENDING 리셋 후 재enqueue
          currentJob.resetForRetry();
          await this.preferenceJobRepository.save(currentJob);

          const jobData: PreferenceJobData = {
            jobId: currentJob.id,
            preferenceId: currentJob.preferenceId,
          };
          await this.preferenceQueue.add('recommend', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          });

          this.logger.warn(
            `Stale job 재시도: jobId=${currentJob.id}, retryCount=${currentJob.retryCount}`,
          );
          retriedCount++;
        } else {
          // 최종 FAILED 확정
          currentJob.markFailed('JOB_TIMEOUT', '추천 작업 시간이 초과되었습니다 (10분)');
          await this.preferenceJobRepository.save(currentJob);

          this.logger.warn(
            `Stale job 최종 타임아웃: jobId=${currentJob.id}`,
          );
          failedCount++;
        }
      }
    }

    if (retriedCount > 0 || failedCount > 0 || skippedCount > 0) {
      this.logger.log(
        `Stale job 처리 완료 - 재시도: ${retriedCount}개, 타임아웃: ${failedCount}개, 스킵: ${skippedCount}개`,
      );
    }
  }
}
