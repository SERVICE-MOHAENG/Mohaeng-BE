import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { RoadmapSurvey } from '../../course/entity/RoadmapSurvey.entity';
import { CourseSurveyDestination } from '../../course/entity/CourseSurveyDestination.entity';
import { CourseSurveyCompanion } from '../../course/entity/CourseSurveyCompanion.entity';
import { CourseSurveyTheme } from '../../course/entity/CourseSurveyTheme.entity';
import { Region } from '../../country/entity/Region.entity';
import { User } from '../../user/entity/User.entity';
import { CreateItineraryResponse } from '../presentation/dto/response/CreateItineraryResponse';
import { ItineraryJobStatusResponse } from '../presentation/dto/response/ItineraryJobStatusResponse';
import { ItineraryResultResponse } from '../presentation/dto/response/ItineraryResultResponse';
import { CreateSurveyRequest } from '../presentation/dto/request/CreateSurveyRequest';
import { CreateSurveyResponse } from '../presentation/dto/response/CreateSurveyResponse';
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
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectQueue('itinerary-generation')
    private readonly itineraryQueue: Queue,
  ) {}

  /**
   * 로드맵 설문 저장
   * @description
   * - 사용자 입력 설문값 저장 후 surveyId 반환
   * - 이후 /itineraries API에서 surveyId를 사용해 비동기 생성을 시작
   */
  async createSurvey(
    userId: string,
    request: CreateSurveyRequest,
  ): Promise<CreateSurveyResponse> {
    const roadmapStart = new Date(request.start_date);
    const roadmapEnd = new Date(request.end_date);
    if (roadmapStart > roadmapEnd) {
      throw new BadRequestException('start_date는 end_date보다 늦을 수 없습니다');
    }

    for (const region of request.regions) {
      const regionStart = new Date(region.start_date);
      const regionEnd = new Date(region.end_date);
      if (regionStart > regionEnd) {
        throw new BadRequestException(
          `지역 ${region.region}의 start_date는 end_date보다 늦을 수 없습니다`,
        );
      }
      if (regionStart < roadmapStart || regionEnd > roadmapEnd) {
        throw new BadRequestException(
          `지역 ${region.region} 일정이 전체 여행 기간을 벗어났습니다`,
        );
      }
    }

    const regionNames = [...new Set(request.regions.map((r) => r.region))];
    const regions = await this.regionRepository.find({
      where: { name: In(regionNames) },
    });

    const regionMap = new Map(regions.map((region) => [region.name, region]));
    const unknownRegions = regionNames.filter((name) => !regionMap.has(name));
    if (unknownRegions.length > 0) {
      throw new BadRequestException(
        `존재하지 않는 지역입니다: ${unknownRegions.join(', ')}`,
      );
    }

    const userRef = new User();
    userRef.id = userId;

    const survey = new RoadmapSurvey();
    survey.user = userRef;
    survey.userId = userId;
    survey.travelCourseId = null;
    survey.paxCount = request.people_count;
    survey.budget = request.budget_range;
    survey.userNote = request.notes ?? null;
    survey.travelStartDay = roadmapStart;
    survey.travelEndDay = roadmapEnd;
    survey.createdAt = new Date();
    survey.pacePreference = request.pace_preference;
    survey.planningPreference = request.planning_preference;
    survey.destinationPreference = request.destination_preference;
    survey.activityPreference = request.activity_preference;
    survey.priorityPreference = request.priority_preference;

    survey.destinations = request.regions.map((regionDto) => {
      const destination = new CourseSurveyDestination();
      const region = regionMap.get(regionDto.region)!;
      destination.region = region;
      destination.regionId = region.id;
      destination.regionName = regionDto.region;
      destination.startDay = new Date(regionDto.start_date);
      destination.endDate = new Date(regionDto.end_date);
      return destination;
    });

    survey.companions = [request.companion_type].map((companionType) => {
      const companion = new CourseSurveyCompanion();
      companion.companion = companionType;
      return companion;
    });

    survey.themes = request.travel_themes.map((themeType) => {
      const theme = new CourseSurveyTheme();
      theme.theme = themeType;
      return theme;
    });

    const savedSurvey = await this.surveyRepository.save(survey);
    return CreateSurveyResponse.from(savedSurvey.id);
  }

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
