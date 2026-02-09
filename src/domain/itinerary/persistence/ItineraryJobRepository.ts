import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../entity/ItineraryStatus.enum';

/**
 * ItineraryJobRepository
 * @description
 * - 여행 일정 생성 작업 데이터 접근 계층
 */
@Injectable()
export class ItineraryJobRepository {
  constructor(
    @InjectRepository(ItineraryJob)
    private readonly repository: Repository<ItineraryJob>,
  ) {}

  async findById(id: string): Promise<ItineraryJob | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: string): Promise<ItineraryJob | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['survey', 'survey.destinations', 'survey.companions', 'survey.themes', 'travelCourse'],
    });
  }

  async findBySurveyId(surveyId: string): Promise<ItineraryJob | null> {
    return this.repository.findOne({ where: { surveyId } });
  }

  /**
   * Stale 상태 Job 조회
   * @description PROCESSING 상태에서 startedAt이 timeoutMinutes를 초과한 Job 목록
   */
  async findStaleJobs(timeoutMinutes: number): Promise<ItineraryJob[]> {
    const threshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return this.repository.find({
      where: {
        status: ItineraryStatus.PROCESSING,
        startedAt: LessThan(threshold),
      },
    });
  }

  async save(job: ItineraryJob): Promise<ItineraryJob> {
    return this.repository.save(job);
  }
}
