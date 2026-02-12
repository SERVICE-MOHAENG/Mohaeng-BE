import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob, IntentStatus } from '../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../entity/ItineraryStatus.enum';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseDay } from '../../course/entity/CourseDay.entity';
import { CoursePlace } from '../../course/entity/CoursePlace.entity';
import { CourseHashTag } from '../../course/entity/CourseHashTag.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { ChatRole } from '../../course/entity/ChatRole.enum';
import { Place } from '../../place/entity/Place.entity';
import { ItineraryJobNotFoundException } from '../exception/ItineraryJobNotFoundException';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';

interface CallbackPlaceData {
  place_name: string;
  place_id: string;
  address: string;
  latitude: number;
  longitude: number;
  place_url: string;
  description: string;
  visit_sequence: number;
  visit_time: string;
}

interface CallbackDayData {
  day_number: number;
  daily_date: string;
  places: CallbackPlaceData[];
}

export interface ModifiedItineraryPayload {
  start_date: string;
  end_date: string;
  trip_days: number;
  nights: number;
  people_count: number;
  tags: string[];
  title: string;
  summary: string;
  itinerary: CallbackDayData[];
}

export interface ModificationSuccessPayload {
  intent_status: 'SUCCESS' | 'ASK_CLARIFICATION' | 'GENERAL_CHAT' | 'REJECTED';
  modified_itinerary?: ModifiedItineraryPayload;
  message: string;
  diff_keys?: string[];
}

export interface ModificationFailurePayload {
  code: string;
  message: string;
}

/**
 * ItineraryModificationCallbackService
 * @description
 * - Python LLM 서버 콜백 처리 (수정)
 * - SUCCESS + intent_status='SUCCESS': TravelCourse 업데이트
 * - SUCCESS + 기타 intent_status: 메시지만 저장
 * - FAILED: 에러 처리
 * - 모든 경우 CourseAiChat 저장
 */
@Injectable()
export class ItineraryModificationCallbackService {
  private readonly logger = new Logger(
    ItineraryModificationCallbackService.name,
  );

  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
    private readonly dataSource: DataSource,
    private readonly redisService: GlobalRedisService,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(CourseAiChat)
    private readonly chatRepository: Repository<CourseAiChat>,
  ) {}

  /**
   * 콜백 성공 처리
   */
  async handleSuccess(
    jobId: string,
    userMessage: string,
    data: ModificationSuccessPayload,
  ): Promise<void> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }

    // 멱등성: 이미 완료된 작업은 무시
    if (
      job.status === ItineraryStatus.SUCCESS ||
      job.status === ItineraryStatus.FAILED
    ) {
      this.logger.warn(
        `Job ${jobId} 이미 ${job.status} 상태입니다. 콜백 무시.`,
      );
      return;
    }

    const intentStatus = this.mapIntentStatus(data.intent_status);

    // Intent에 따라 다른 처리
    if (intentStatus === IntentStatus.SUCCESS && data.modified_itinerary) {
      // TravelCourse 업데이트 + 대화 저장
      await this.updateTravelCourse(
        job,
        data.modified_itinerary,
        data.message,
        data.diff_keys,
      );
    } else {
      // TravelCourse 업데이트 없이 대화만 저장
      await this.saveChatHistoryOnly(
        job,
        userMessage,
        data.message,
        intentStatus,
        data.diff_keys,
      );
    }

    // 대화 이력 저장 (USER + AI)
    await this.saveChatHistory(job.travelCourseId!, userMessage, data.message);

    // Redis Pub/Sub: 성공 알림 발행
    await this.redisService.publish(
      `job:${jobId}:status`,
      JSON.stringify({
        status: 'SUCCESS',
        jobId,
        intentStatus: data.intent_status,
      }),
    );

    this.logger.log(
      `Job ${jobId} 성공 처리 완료 (intent: ${data.intent_status})`,
    );
  }

  /**
   * 콜백 실패 처리
   */
  async handleFailure(
    jobId: string,
    error: ModificationFailurePayload,
  ): Promise<void> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }

    // 멱등성: 이미 완료된 작업은 무시
    if (
      job.status === ItineraryStatus.SUCCESS ||
      job.status === ItineraryStatus.FAILED
    ) {
      this.logger.warn(
        `Job ${jobId} 이미 ${job.status} 상태입니다. 콜백 무시.`,
      );
      return;
    }

    job.markFailed(error.code, error.message);
    await this.itineraryJobRepository.save(job);

    // Redis Pub/Sub: 실패 알림 발행
    await this.redisService.publish(
      `job:${jobId}:status`,
      JSON.stringify({
        status: 'FAILED',
        jobId,
        error: {
          code: error.code,
          message: error.message,
        },
      }),
    );

    this.logger.warn(`Job ${jobId} 실패 처리: ${error.code} - ${error.message}`);
  }

  /**
   * TravelCourse 업데이트 (트랜잭션)
   * @description SUCCESS + intent_status='SUCCESS'일 때만 호출
   */
  private async updateTravelCourse(
    job: ItineraryJob,
    modifiedData: ModifiedItineraryPayload,
    message: string,
    diffKeys?: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. TravelCourse 로드
      const course = await manager.findOne(TravelCourse, {
        where: { id: job.travelCourseId! },
        relations: ['courseDays', 'courseDays.coursePlaces', 'hashTags'],
      });

      if (!course) {
        throw new Error(`TravelCourse not found: ${job.travelCourseId}`);
      }

      // 2. 기존 CourseDay 삭제 (CASCADE로 CoursePlace도 삭제됨)
      if (course.courseDays && course.courseDays.length > 0) {
        await manager.delete(CourseDay, {
          travelCourse: { id: course.id },
        });
      }

      // 3. HashTags 업데이트
      await manager.delete(CourseHashTag, {
        travelCourse: { id: course.id },
      });

      if (modifiedData.tags && modifiedData.tags.length > 0) {
        const hashTags = modifiedData.tags.map((tag) =>
          CourseHashTag.create(tag, course),
        );
        await manager.save(CourseHashTag, hashTags);
      }

      // 4. 새 CourseDay + CoursePlace 생성
      for (const dayData of modifiedData.itinerary) {
        const courseDay = CourseDay.create(
          course,
          dayData.day_number,
          new Date(dayData.daily_date),
        );
        const savedDay = await manager.save(CourseDay, courseDay);

        for (const placeData of dayData.places) {
          // Place upsert
          let place = await manager.findOne(Place, {
            where: { placeId: placeData.place_id },
          });

          if (place) {
            place.name = placeData.place_name;
            place.address = placeData.address;
            place.latitude = placeData.latitude;
            place.longitude = placeData.longitude;
            place.description = placeData.description;
            place.placeUrl = placeData.place_url;
            place.updatedAt = new Date();
          } else {
            // 지역 정보는 기존 설문 기반으로 유지 (수정 시에는 지역 변경 불가)
            place = Place.create(
              placeData.place_id,
              placeData.place_name,
              placeData.address,
              placeData.latitude,
              placeData.longitude,
              placeData.place_url,
              null, // region은 나중에 설정 가능
              placeData.description,
            );
          }
          await manager.save(Place, place);

          // CoursePlace 생성
          const coursePlace = CoursePlace.create(
            savedDay,
            place,
            placeData.visit_sequence,
            undefined,
            placeData.visit_time,
            placeData.description,
          );
          await manager.save(CoursePlace, coursePlace);
        }
      }

      // 5. TravelCourse 메타데이터 업데이트
      course.title = modifiedData.title;
      course.description = modifiedData.summary;
      course.nights = modifiedData.nights;
      course.days = modifiedData.trip_days;
      course.peopleCount = modifiedData.people_count;
      course.travelStartDay = new Date(modifiedData.start_date);
      course.travelFinishDay = new Date(modifiedData.end_date);
      course.updatedAt = new Date();
      await manager.save(TravelCourse, course);

      // 6. ItineraryJob 업데이트
      job.markSuccessWithIntent(
        IntentStatus.SUCCESS,
        message,
        diffKeys ?? null,
      );
      await manager.save(ItineraryJob, job);
    });
  }

  /**
   * 대화 이력만 저장 (TravelCourse 업데이트 없음)
   * @description ASK_CLARIFICATION, GENERAL_CHAT, REJECTED일 때 사용
   */
  private async saveChatHistoryOnly(
    job: ItineraryJob,
    userMessage: string,
    aiMessage: string,
    intentStatus: IntentStatus,
    diffKeys?: string[],
  ): Promise<void> {
    job.markSuccessWithIntent(intentStatus, aiMessage, diffKeys ?? null);
    await this.itineraryJobRepository.save(job);
  }

  /**
   * 대화 이력 저장 (USER + AI)
   * @description 최대 10개(5쌍)까지만 저장 가능. 요청 전에 개수 체크됨
   */
  private async saveChatHistory(
    travelCourseId: string,
    userMessage: string,
    aiMessage: string,
  ): Promise<void> {
    const course = new TravelCourse();
    course.id = travelCourseId;

    // USER 메시지 저장
    const userChat = new CourseAiChat();
    userChat.role = ChatRole.USER;
    userChat.content = userMessage;
    userChat.travelCourse = course;
    await this.chatRepository.save(userChat);

    // AI 메시지 저장
    const aiChat = new CourseAiChat();
    aiChat.role = ChatRole.AI;
    aiChat.content = aiMessage;
    aiChat.travelCourse = course;
    await this.chatRepository.save(aiChat);

    this.logger.log(`로드맵 ${travelCourseId}: 대화 저장 완료`);
  }

  /**
   * Intent 문자열을 IntentStatus enum으로 변환
   */
  private mapIntentStatus(
    intentStatus: string,
  ): IntentStatus {
    switch (intentStatus) {
      case 'SUCCESS':
        return IntentStatus.SUCCESS;
      case 'ASK_CLARIFICATION':
        return IntentStatus.ASK_CLARIFICATION;
      case 'GENERAL_CHAT':
        return IntentStatus.GENERAL_CHAT;
      case 'REJECTED':
        return IntentStatus.REJECTED;
      default:
        this.logger.warn(`Unknown intent status: ${intentStatus}, defaulting to GENERAL_CHAT`);
        return IntentStatus.GENERAL_CHAT;
    }
  }
}
