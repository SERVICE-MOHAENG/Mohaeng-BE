import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseLikeRepository } from '../persistence/CourseLikeRepository';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseDay } from '../entity/CourseDay.entity';
import { CoursePlace } from '../entity/CoursePlace.entity';
import { CourseCountry } from '../entity/CourseCountry.entity';
import { CourseRegion } from '../entity/CourseRegion.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { CreateCourseRequest } from '../presentation/dto/request/CreateCourseRequest';
import { UpdateCourseRequest } from '../presentation/dto/request/UpdateCourseRequest';
import { CourseResponse } from '../presentation/dto/response/CourseResponse';
import { CourseDetailResponse } from '../presentation/dto/response/CourseDetailResponse';
import { CopyRoadmapResponse } from '../presentation/dto/response/CopyRoadmapResponse';
import { CoursesResponse } from '../presentation/dto/response/CoursesResponse';
import { CourseDetailListResponse } from '../presentation/dto/response/CourseDetailListResponse';
import { MainPageCourseResponse } from '../presentation/dto/response/MainPageCourseResponse';
import { MainPageCoursesResponse } from '../presentation/dto/response/MainPageCoursesResponse';
import {
  ItineraryJob,
  ItineraryJobType,
} from '../../itinerary/entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../itinerary/entity/ItineraryStatus.enum';

/**
 * TravelCourse Service
 * @description
 * - 여행 코스 도메인 비즈니스 로직
 */
@Injectable()
export class TravelCourseService {
  constructor(
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly userRepository: UserRepository,
    private readonly courseLikeRepository: CourseLikeRepository,
    @InjectRepository(ItineraryJob)
    private readonly itineraryJobRepository: Repository<ItineraryJob>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * ID로 여행 코스 조회
   */
  async findById(id: string): Promise<TravelCourse> {
    const course = await this.travelCourseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException();
    }
    return course;
  }

  /**
   * ID로 여행 코스 조회 (사용자 좋아요 상태 포함)
   */
  async findByIdWithUserStatus(
    id: string,
    userId: string,
  ): Promise<CourseResponse> {
    const course = await this.findById(id);

    if (!course.isPublic && course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    const isLiked = await this.courseLikeRepository.existsByUserIdAndCourseId(
      userId,
      id,
    );

    return CourseResponse.fromEntityWithUserStatus(course, isLiked);
  }

  async findDetailById(
    id: string,
    userId: string,
  ): Promise<CourseDetailResponse> {
    const course = await this.findById(id);

    if (!course.isPublic && course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    const latestGenerationJob =
      await this.findLatestGenerationJobByCourseId(id);

    return CourseDetailResponse.fromEntity(course, latestGenerationJob);
  }

  /**
   * 사용자 ID로 여행 코스 목록 조회
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelCourse[], number]> {
    return this.travelCourseRepository.findByUserId(userId, page, limit);
  }

  /**
   * 공개 여행 코스 목록 조회
   */
  async findPublicCourses(
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelCourse[], number]> {
    return this.travelCourseRepository.findPublicCourses(page, limit);
  }

  /**
   * 여행 코스 생성 (DTO 기반)
   */
  async createCourse(
    userId: string,
    request: CreateCourseRequest,
  ): Promise<CourseResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const course = TravelCourse.create(
      request.title,
      user,
      request.nights,
      request.days,
      request.description,
      undefined,
      request.isPublic ?? false,
      undefined,
    );

    const savedCourse = await this.travelCourseRepository.save(course);
    return CourseResponse.fromEntity(savedCourse);
  }

  /**
   * 여행 코스 생성 (레거시 - 하위 호환성 유지)
   */
  async create(
    title: string,
    user: User,
    nights: number,
    days: number,
    description?: string,
    imageUrl?: string,
    isPublic: boolean = true,
    countries?: Country[],
  ): Promise<TravelCourse> {
    const course = TravelCourse.create(
      title,
      user,
      nights,
      days,
      description,
      imageUrl,
      isPublic,
      countries,
    );
    return this.travelCourseRepository.save(course);
  }

  /**
   * 여행 코스 수정
   */
  async updateCourse(
    courseId: string,
    userId: string,
    request: UpdateCourseRequest,
  ): Promise<CourseResponse> {
    const course = await this.findById(courseId);

    if (course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    if (request.title !== undefined) course.title = request.title;
    if (request.description !== undefined)
      course.description = request.description;
    if (request.nights !== undefined) course.nights = request.nights;
    if (request.days !== undefined) course.days = request.days;
    if (request.isPublic !== undefined) course.isPublic = request.isPublic;

    const updatedCourse = await this.travelCourseRepository.save(course);
    return CourseResponse.fromEntity(updatedCourse);
  }

  /**
   * 여행 코스 완료 여부 변경
   */
  async updateCompletionStatus(
    courseId: string,
    userId: string,
    isCompleted: boolean,
  ): Promise<CourseResponse> {
    await this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(TravelCourse, {
        where: { id: courseId },
        relations: ['user'],
      });

      if (!course) {
        throw new CourseNotFoundException();
      }

      if (course.user.id !== userId) {
        throw new CourseAccessDeniedException();
      }

      course.isCompleted = isCompleted;
      await manager.save(TravelCourse, course);

      const visitedCountries =
        await this.travelCourseRepository.countDistinctCompletedCountriesByUserId(
          userId,
          manager,
        );
      await manager.update(User, userId, { visitedCountries });
    });

    return CourseResponse.fromEntity(await this.findById(courseId));
  }

  /**
   * 내 여행 코스 목록 조회
   */
  async getMyCourses(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CourseDetailListResponse> {
    const [courses, total] = await this.findByUserId(userId, page, limit);
    const latestGenerationJobs = await this.findLatestGenerationJobsByCourseIds(
      courses.map((course) => course.id),
    );
    const roadmaps = courses.map((course) =>
      CourseDetailResponse.fromEntity(
        course,
        latestGenerationJobs.get(course.id) ?? null,
      ),
    );

    return {
      courses: roadmaps,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 여행 코스 조회수 증가
   */
  async incrementViewCount(id: string): Promise<TravelCourse> {
    const course = await this.findById(id);
    course.incrementViewCount();
    return this.travelCourseRepository.save(course);
  }

  /**
   * 여행 코스 삭제 (소유권 검증 포함)
   */
  async deleteCourse(courseId: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(TravelCourse, {
        where: { id: courseId },
        relations: ['user'],
      });

      if (!course) {
        throw new CourseNotFoundException();
      }

      if (course.user.id !== userId) {
        throw new CourseAccessDeniedException();
      }

      const shouldSyncVisitedCountries = course.isCompleted;

      await manager.delete(TravelCourse, course.id);

      if (shouldSyncVisitedCountries) {
        const visitedCountries =
          await this.travelCourseRepository.countDistinctCompletedCountriesByUserId(
            userId,
            manager,
          );
        await manager.update(User, userId, { visitedCountries });
      }
    });
  }

  /**
   * 다른 사용자의 로드맵 복사
   */
  async copyRoadmap(
    sourceId: string,
    userId: string,
  ): Promise<CopyRoadmapResponse> {
    const source =
      await this.travelCourseRepository.findByIdWithAllRelations(sourceId);
    if (!source) {
      throw new CourseNotFoundException();
    }

    if (!source.isPublic && source.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const newCourse = await this.dataSource.transaction(async (manager) => {
      const course = new TravelCourse();
      course.title = source.title;
      course.user = user;
      course.nights = source.nights;
      course.days = source.days;
      course.description = source.description;
      course.imageUrl = source.imageUrl;
      course.isPublic = true;
      course.viewCount = 0;
      course.likeCount = 0;
      course.modificationCount = 0;
      course.peopleCount = source.peopleCount;
      course.travelStartDay = source.travelStartDay;
      course.travelFinishDay = source.travelFinishDay;
      course.sourceCourseId = source.id;
      course.isCompleted = false;
      const savedCourse = await manager.save(TravelCourse, course);

      for (const cc of source.courseCountries || []) {
        await manager.save(
          CourseCountry,
          CourseCountry.create(savedCourse, cc.country),
        );
      }

      for (const day of source.courseDays || []) {
        const newDay = await manager.save(
          CourseDay,
          CourseDay.create(savedCourse, day.dayNumber, day.date),
        );
        for (const cp of day.coursePlaces || []) {
          await manager.save(
            CoursePlace,
            CoursePlace.create(
              newDay,
              cp.place,
              cp.visitOrder,
              cp.memo ?? undefined,
              cp.visitTime ?? undefined,
              cp.description ?? undefined,
            ),
          );
        }
      }

      for (const region of source.courseRegions || []) {
        const newRegion = new CourseRegion();
        newRegion.travelCourse = savedCourse;
        newRegion.travelCourseId = savedCourse.id;
        newRegion.region = region.region;
        newRegion.regionId = region.regionId;
        newRegion.regionName = region.regionName;
        newRegion.startDate = region.startDate;
        newRegion.endDate = region.endDate;
        await manager.save(CourseRegion, newRegion);
      }

      return savedCourse;
    });

    return CopyRoadmapResponse.of(newCourse.id);
  }

  /**
   * 여행 코스 삭제 (레거시 - 하위 호환성 유지)
   */
  async delete(id: string): Promise<void> {
    const course = await this.findById(id);
    await this.travelCourseRepository.delete(course.id);
  }

  /**
   * 메인페이지용 코스 조회
   */
  async getCoursesForMainPage(
    sortBy: 'latest' | 'popular' = 'latest',
    countryCode?: string,
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<MainPageCoursesResponse> {
    const [courses, total] =
      await this.travelCourseRepository.findCoursesForMainPage(
        sortBy,
        countryCode,
        page,
        limit,
      );

    let courseResponses: MainPageCourseResponse[];

    if (userId) {
      courseResponses = await Promise.all(
        courses.map(async (course) => {
          const isLiked =
            await this.courseLikeRepository.existsByUserIdAndCourseId(
              userId,
              course.id,
            );
          return MainPageCourseResponse.fromEntity(course, isLiked);
        }),
      );
    } else {
      courseResponses = courses.map((course) =>
        MainPageCourseResponse.fromEntity(course),
      );
    }

    return {
      courses: courseResponses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicCoursesByRegion(
    regionId: string,
    sortBy: 'latest' | 'popular' = 'latest',
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<CoursesResponse> {
    const [courses, total] =
      await this.travelCourseRepository.findPublicCoursesByRegion(
        regionId,
        sortBy,
        page,
        limit,
      );

    let courseResponses: CourseResponse[];

    if (userId) {
      courseResponses = await Promise.all(
        courses.map(async (course) => {
          const isLiked =
            await this.courseLikeRepository.existsByUserIdAndCourseId(
              userId,
              course.id,
            );
          const response = this.mapToCourseResponse(course);
          response.isLiked = isLiked;
          return response;
        }),
      );
    } else {
      courseResponses = courses.map((course) =>
        this.mapToCourseResponse(course),
      );
    }

    return {
      courses: courseResponses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * TravelCourse 엔티티를 CourseResponse DTO로 변환
   */
  private mapToCourseResponse(course: TravelCourse): CourseResponse {
    return CourseResponse.fromEntity(course);
  }

  private async findLatestGenerationJobByCourseId(
    courseId: string,
  ): Promise<ItineraryJob | null> {
    return this.itineraryJobRepository.findOne({
      where: {
        travelCourseId: courseId,
        status: ItineraryStatus.SUCCESS,
        jobType: ItineraryJobType.GENERATION,
      },
      order: {
        completedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  private async findLatestGenerationJobsByCourseIds(
    courseIds: string[],
  ): Promise<Map<string, ItineraryJob>> {
    if (courseIds.length === 0) {
      return new Map();
    }

    const jobs = await this.itineraryJobRepository.find({
      where: courseIds.map((courseId) => ({
        travelCourseId: courseId,
        status: ItineraryStatus.SUCCESS,
        jobType: ItineraryJobType.GENERATION,
      })),
      order: {
        completedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    const latestJobs = new Map<string, ItineraryJob>();

    for (const job of jobs) {
      if (!job.travelCourseId || latestJobs.has(job.travelCourseId)) {
        continue;
      }
      latestJobs.set(job.travelCourseId, job);
    }

    return latestJobs;
  }
}
