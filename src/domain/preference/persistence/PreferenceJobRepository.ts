import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { PreferenceJob, PreferenceJobStatus } from '../entity/PreferenceJob.entity';

/**
 * PreferenceJobRepository
 */
@Injectable()
export class PreferenceJobRepository {
  constructor(
    @InjectRepository(PreferenceJob)
    private readonly repository: Repository<PreferenceJob>,
  ) {}

  async save(job: PreferenceJob): Promise<PreferenceJob> {
    return this.repository.save(job);
  }

  async findById(id: string): Promise<PreferenceJob | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<PreferenceJob | null> {
    return this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Stale 상태 Job 조회
   * @description PROCESSING 상태에서 startedAt이 timeoutMinutes를 초과한 Job 목록
   */
  async findStaleJobs(timeoutMinutes: number): Promise<PreferenceJob[]> {
    const threshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return this.repository.find({
      where: {
        status: PreferenceJobStatus.PROCESSING,
        startedAt: LessThan(threshold),
      },
    });
  }
}
