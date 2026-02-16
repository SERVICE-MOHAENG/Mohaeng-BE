import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { ItineraryJob, ItineraryJobType } from '../entity/ItineraryJob.entity';
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

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ItineraryJob | null> {
    return this.repository.findOne({ where: { id, userId } });
  }

  async findByIdAndUserIdWithRelations(
    id: string,
    userId: string,
  ): Promise<ItineraryJob | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['survey', 'survey.destinations', 'survey.companions', 'survey.themes', 'travelCourse'],
    });
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
   * Survey의 진행 중인 작업 조회 (PENDING 또는 PROCESSING)
   * @description 재시도 허용을 위해 진행 중인 작업만 체크
   */
  async findActiveBySurveyId(surveyId: string): Promise<ItineraryJob | null> {
    return this.repository.findOne({
      where: {
        surveyId,
        status: In([ItineraryStatus.PENDING, ItineraryStatus.PROCESSING]),
      },
    });
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

  /**
   * TravelCourse의 진행 중인 작업 조회 (PENDING 또는 PROCESSING)
   * @description 동시 수정 방지를 위한 체크
   */
  async findActiveByTravelCourseId(
    travelCourseId: string,
  ): Promise<ItineraryJob | null> {
    return this.repository.findOne({
      where: [
        { travelCourseId, status: ItineraryStatus.PENDING },
        { travelCourseId, status: ItineraryStatus.PROCESSING },
      ],
    });
  }

  /**
   * TravelCourse의 수정 작업 목록 조회
   * @description MODIFICATION 타입 작업을 최신순으로 조회
   */
  async findModificationJobsByTravelCourseId(
    travelCourseId: string,
  ): Promise<ItineraryJob[]> {
    return this.repository.find({
      where: {
        travelCourseId,
        jobType: ItineraryJobType.MODIFICATION,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
