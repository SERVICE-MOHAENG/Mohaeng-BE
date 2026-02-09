import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { RoadmapSurvey } from '../../course/entity/RoadmapSurvey.entity';
import { CreateItineraryResponse } from '../presentation/dto/response/CreateItineraryResponse';
import { ItineraryJobStatusResponse } from '../presentation/dto/response/ItineraryJobStatusResponse';
import { ItineraryResultResponse } from '../presentation/dto/response/ItineraryResultResponse';
import { ItineraryJobNotFoundException } from '../exception/ItineraryJobNotFoundException';
import { ItineraryJobAlreadyProcessingException } from '../exception/ItineraryJobAlreadyProcessingException';
import { SurveyNotFoundException } from '../exception/SurveyNotFoundException';

/**
 * ItineraryService
 * @description
 * - 여행 일정 생성 요청 처리
 * - BullMQ 큐에 작업 등록
 * - 작업 상태 및 결과 조회
 */
@Injectable()
export class ItineraryService {
  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
    @InjectRepository(RoadmapSurvey)
    private readonly surveyRepository: Repository<RoadmapSurvey>,
    @InjectQueue('itinerary-generation')
    private readonly itineraryQueue: Queue,
  ) {}

  /**
   * 여정 생성 요청
   * @description
   * - surveyId 유효성 검증
   * - 중복 작업 체크
   * - ItineraryJob 생성 (PENDING)
   * - BullMQ 큐에 job 추가
   */
  async createItinerary(
    userId: string,
    surveyId: string,
  ): Promise<CreateItineraryResponse> {
    // 1. 설문 존재 확인
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId, userId },
    });
    if (!survey) {
      throw new SurveyNotFoundException();
    }

    // 2. 중복 작업 체크
    const existingJob =
      await this.itineraryJobRepository.findBySurveyId(surveyId);
    if (existingJob) {
      throw new ItineraryJobAlreadyProcessingException();
    }

    // 3. ItineraryJob 생성
    const job = ItineraryJob.create(userId, surveyId);
    const savedJob = await this.itineraryJobRepository.save(job);

    // 4. BullMQ 큐에 작업 추가
    await this.itineraryQueue.add('generate-itinerary', {
      jobId: savedJob.id,
      surveyId,
    });

    return CreateItineraryResponse.from(savedJob);
  }

  /**
   * 작업 상태 조회 (polling용)
   */
  async getJobStatus(jobId: string): Promise<ItineraryJobStatusResponse> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }
    return ItineraryJobStatusResponse.from(job);
  }

  /**
   * 작업 결과 조회 (전체 데이터)
   */
  async getJobResult(jobId: string): Promise<ItineraryResultResponse> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }
    return ItineraryResultResponse.from(job);
  }
}
