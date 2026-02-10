import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../entity/ItineraryStatus.enum';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseDay } from '../../course/entity/CourseDay.entity';
import { CoursePlace } from '../../course/entity/CoursePlace.entity';
import { CourseHashTag } from '../../course/entity/CourseHashTag.entity';
import { CourseRegion } from '../../course/entity/CourseRegion.entity';
import { Place } from '../../place/entity/Place.entity';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';
import { CourseSurveyDestination } from '../../course/entity/CourseSurveyDestination.entity';
import { Region } from '../../country/entity/Region.entity';
import { User } from '../../user/entity/User.entity';
import { ItineraryJobNotFoundException } from '../exception/ItineraryJobNotFoundException';

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

export interface ItinerarySuccessPayload {
  start_date: string;
  end_date: string;
  trip_days: number;
  nights: number;
  people_count: number;
  tags: string[];
  title: string;
  summary: string;
  itinerary: CallbackDayData[];
  llm_commentary: string;
  next_action_suggestion: string[];
}

export interface ItineraryFailurePayload {
  code: string;
  message: string;
}

/**
 * ItineraryCallbackService
 * @description
 * - Python LLM 서버 콜백 처리
 * - 성공 시 TravelCourse, CourseDay, CoursePlace, Place, CourseHashTag 생성
 * - 실패 시 ItineraryJob 상태 업데이트
 */
@Injectable()
export class ItineraryCallbackService {
  private readonly logger = new Logger(ItineraryCallbackService.name);

  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(CourseSurvey)
    private readonly surveyRepository: Repository<CourseSurvey>,
  ) {}

  /**
   * 콜백 성공 처리
   * @description
   * - 트랜잭션 내에서 Place upsert, TravelCourse 생성
   * - ItineraryJob SUCCESS 업데이트
   * - CourseSurvey.travelCourseId 업데이트
   */
  async handleSuccess(
    jobId: string,
    data: ItinerarySuccessPayload,
  ): Promise<void> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }

    // 이미 완료된 작업은 무시 (멱등성)
    if (
      job.status === ItineraryStatus.SUCCESS ||
      job.status === ItineraryStatus.FAILED
    ) {
      this.logger.warn(
        `Job ${jobId} 이미 ${job.status} 상태입니다. 콜백 무시.`,
      );
      return;
    }

    // 설문 데이터 로드 (Region 매핑용)
    const survey = await this.surveyRepository.findOne({
      where: { id: job.surveyId },
      relations: ['destinations', 'destinations.region'],
    });

    await this.dataSource.transaction(async (manager) => {
      // 1. User 참조 생성
      const userRef = new User();
      userRef.id = job.userId;

      // 2. TravelCourse 생성
      const course = new TravelCourse();
      course.title = data.title;
      course.description = data.summary;
      course.nights = data.nights;
      course.days = data.trip_days;
      course.travelStartDay = new Date(data.start_date);
      course.travelFinishDay = new Date(data.end_date);
      course.user = userRef;
      course.isPublic = false;
      course.viewCount = 0;
      course.likeCount = 0;
      course.bookmarkCount = 0;
      course.createdAt = new Date();
      course.updatedAt = new Date();
      const savedCourse = await manager.save(TravelCourse, course);

      // 3. CourseRegion 매핑 (설문의 destination 기반)
      if (survey?.destinations) {
        for (const dest of survey.destinations) {
          const courseRegion = new CourseRegion();
          courseRegion.travelCourse = savedCourse;
          courseRegion.region = dest.region;
          courseRegion.regionName = dest.regionName;
          courseRegion.startDate = new Date(dest.startDay);
          courseRegion.endDate = new Date(dest.endDate);
          await manager.save(CourseRegion, courseRegion);
        }
      }

      // 4. HashTags 생성
      if (data.tags && data.tags.length > 0) {
        const hashTags = data.tags.map((tag) =>
          CourseHashTag.create(tag, savedCourse),
        );
        await manager.save(CourseHashTag, hashTags);
      }

      // 5. CourseDay + CoursePlace + Place 생성
      for (const dayData of data.itinerary) {
        const courseDay = CourseDay.create(
          savedCourse,
          dayData.day_number,
          new Date(dayData.daily_date),
        );
        const savedDay = await manager.save(CourseDay, courseDay);

        for (const placeData of dayData.places) {
          // Place upsert: 기존 Place가 있으면 업데이트, 없으면 생성
          const region = this.resolveRegion(
            survey?.destinations ?? [],
            dayData.daily_date,
          );

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
            place = Place.create(
              placeData.place_id,
              placeData.place_name,
              placeData.address,
              placeData.latitude,
              placeData.longitude,
              placeData.place_url,
              region,
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

      // 6. ItineraryJob 성공 업데이트
      job.markSuccess(
        savedCourse.id,
        data.llm_commentary,
        data.next_action_suggestion,
      );
      await manager.save(ItineraryJob, job);

      // 7. CourseSurvey.travelCourseId 업데이트
      if (survey) {
        survey.travelCourseId = savedCourse.id;
        await manager.save(CourseSurvey, survey);
      }
    });

    this.logger.log(`Job ${jobId} 성공 처리 완료`);
  }

  /**
   * 콜백 실패 처리
   */
  async handleFailure(
    jobId: string,
    error: ItineraryFailurePayload,
  ): Promise<void> {
    const job = await this.itineraryJobRepository.findById(jobId);
    if (!job) {
      throw new ItineraryJobNotFoundException();
    }

    // 이미 완료된 작업은 무시 (멱등성)
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

    this.logger.warn(`Job ${jobId} 실패 처리: ${error.code} - ${error.message}`);
  }

  /**
   * 날짜 기반 Region 매칭
   * @description 설문의 CourseSurveyDestination에서 해당 날짜에 맞는 Region을 찾음
   */
  private resolveRegion(
    destinations: CourseSurveyDestination[],
    dailyDate: string,
  ): Region {
    const date = new Date(dailyDate);

    for (const dest of destinations) {
      const startDay = new Date(dest.startDay);
      const endDate = new Date(dest.endDate);
      if (date >= startDay && date <= endDate) {
        return dest.region;
      }
    }

    // fallback: 첫 번째 destination의 region
    if (destinations.length > 0) {
      return destinations[0].region;
    }

    // 최후 fallback: 빈 Region 참조 (이 경우는 발생하지 않아야 함)
    const fallbackRegion = new Region();
    fallbackRegion.id = destinations[0]?.regionId ?? '';
    return fallbackRegion;
  }
}
