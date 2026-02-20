import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryStatus } from '../entity/ItineraryStatus.enum';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';

/**
 * ItineraryJobCleanupService
 * @description
 * - Stale Job 감지 크론잡
 * - 매 분마다 PROCESSING 상태에서 3분 초과된 Job을 FAILED 처리
 */
@Injectable()
export class ItineraryJobCleanupService {
  private readonly logger = new Logger(ItineraryJobCleanupService.name);
  private static readonly TIMEOUT_MINUTES = 10;

  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
    private readonly redisService: GlobalRedisService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async detectStaleJobs(): Promise<void> {
    const staleJobs = await this.itineraryJobRepository.findStaleJobs(
      ItineraryJobCleanupService.TIMEOUT_MINUTES,
    );

    let processedCount = 0;
    let skippedCount = 0;

    for (const job of staleJobs) {
      // Race condition 방지: 저장 전에 최신 상태 재확인
      const currentJob = await this.itineraryJobRepository.findById(job.id);

      if (!currentJob) {
        this.logger.warn(`Job not found during cleanup: jobId=${job.id}`);
        continue;
      }

      // 이미 SUCCESS 또는 FAILED로 변경된 경우 스킵 (콜백이 먼저 처리됨)
      if (
        currentJob.status === ItineraryStatus.SUCCESS ||
        currentJob.status === ItineraryStatus.FAILED
      ) {
        this.logger.debug(
          `Job already completed with status ${currentJob.status}, skipping: jobId=${job.id}`,
        );
        skippedCount++;
        continue;
      }

      // 여전히 PROCESSING 상태인 경우에만 타임아웃 처리
      if (currentJob.status === ItineraryStatus.PROCESSING) {
        currentJob.markFailed('TIMEOUT', '일정 생성 시간이 초과되었습니다 (3분)');
        await this.itineraryJobRepository.save(currentJob);

        // Redis Pub/Sub: 타임아웃 알림 발행
        await this.redisService.publish(
          `job:${currentJob.id}:status`,
          JSON.stringify({
            status: 'FAILED',
            jobId: currentJob.id,
            error: {
              code: 'TIMEOUT',
              message: '일정 생성 시간이 초과되었습니다 (3분)',
            },
          }),
        );

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
