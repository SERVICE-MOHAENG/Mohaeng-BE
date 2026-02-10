import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';

/**
 * ItineraryJobCleanupService
 * @description
 * - Stale Job 감지 크론잡
 * - 매 분마다 PROCESSING 상태에서 3분 초과된 Job을 FAILED 처리
 */
@Injectable()
export class ItineraryJobCleanupService {
  private readonly logger = new Logger(ItineraryJobCleanupService.name);
  private static readonly TIMEOUT_MINUTES = 3;

  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async detectStaleJobs(): Promise<void> {
    const staleJobs = await this.itineraryJobRepository.findStaleJobs(
      ItineraryJobCleanupService.TIMEOUT_MINUTES,
    );

    for (const job of staleJobs) {
      job.markFailed('TIMEOUT', '일정 생성 시간이 초과되었습니다 (3분)');
      await this.itineraryJobRepository.save(job);
      this.logger.warn(`Stale job 타임아웃 처리: jobId=${job.id}`);
    }

    if (staleJobs.length > 0) {
      this.logger.log(`${staleJobs.length}개의 stale job 처리 완료`);
    }
  }
}
