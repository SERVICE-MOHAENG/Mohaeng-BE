import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseLikeRepository } from '../persistence/CourseLikeRepository';
import { CourseBookmarkRepository } from '../persistence/CourseBookmarkRepository';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { InvalidDateRangeException } from '../exception/InvalidDateRangeException';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { CreateCourseRequest } from '../presentation/dto/request/CreateCourseRequest';
import { UpdateCourseRequest } from '../presentation/dto/request/UpdateCourseRequest';
import { CourseResponse } from '../presentation/dto/response/CourseResponse';
import { CoursesResponse } from '../presentation/dto/response/CoursesResponse';
import { CoursePlaceResponse } from '../presentation/dto/response/CoursePlaceResponse';

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
    private readonly courseBookmarkRepository: CourseBookmarkRepository,
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
   * ID로 여행 코스 조회 (사용자 상태 포함)
   */
  async findByIdWithUserStatus(
    id: string,
    userId: string,
  ): Promise<CourseResponse> {
    const course = await this.findById(id);

    // 비공개 코스 접근 검증
    if (!course.isPublic && course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    const [isLiked, isBookmarked] = await Promise.all([
      this.courseLikeRepository.existsByUserIdAndCourseId(userId, id),
      this.courseBookmarkRepository.existsByUserIdAndCourseId(userId, id),
    ]);

    return CourseResponse.fromEntityWithUserStatus(course, isLiked, isBookmarked);
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

    if (new Date(request.travelStartDay) > new Date(request.travelFinishDay)) {
      throw new InvalidDateRangeException();
    }

    const course = TravelCourse.create(
      request.title,
      user,
      request.nights,
      request.days,
      request.travelStartDay,
      request.travelFinishDay,
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
    travelStartDay: Date,
    travelFinishDay: Date,
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
      travelStartDay,
      travelFinishDay,
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

    // 소유권 검증
    if (course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    // 필드 업데이트
    if (request.title !== undefined) {
      course.title = request.title;
    }
    if (request.description !== undefined) {
      course.description = request.description;
    }
    if (request.nights !== undefined) {
      course.nights = request.nights;
    }
    if (request.days !== undefined) {
      course.days = request.days;
    }
    if (request.isPublic !== undefined) {
      course.isPublic = request.isPublic;
    }

    const updatedCourse = await this.travelCourseRepository.save(course);
    return CourseResponse.fromEntity(updatedCourse);
  }

  /**
   * 내 여행 코스 목록 조회
   */
  async getMyCourses(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CoursesResponse> {
    const [courses, total] = await this.findByUserId(userId, page, limit);

    const coursesWithStatus = await Promise.all(
      courses.map(async (course) => {
        const [isLiked, isBookmarked] = await Promise.all([
          this.courseLikeRepository.existsByUserIdAndCourseId(userId, course.id),
          this.courseBookmarkRepository.existsByUserIdAndCourseId(userId, course.id),
        ]);
        return CourseResponse.fromEntityWithUserStatus(course, isLiked, isBookmarked);
      }),
    );

    return {
      courses: coursesWithStatus,
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
    const course = await this.findById(courseId);

    // 소유권 검증
    if (course.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    await this.travelCourseRepository.delete(course.id);
  }

  /**
   * 여행 코스 삭제 (레거시 - 하위 호환성 유지)
   */
  async delete(id: string): Promise<void> {
    const course = await this.findById(id);
    await this.travelCourseRepository.delete(course.id);
  }

  /**
   * 메인페이지용 인기 코스 조회
   * @description
   * - 공개 코스만 조회
   * - 좋아요순 정렬
   * - 국가별 필터링 가능 (ISO 3166-1 alpha-2 코드)
   * - 최대 10개까지 조회
   * - userId가 제공되면 좋아요/북마크 상태 포함
   */
  async getCoursesForMainPage(
    countryCode?: string,
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<CoursesResponse> {
    const [courses, total] =
      await this.travelCourseRepository.findPopularCoursesForMainPage(
        countryCode,
        page,
        limit,
      );

    let courseResponses: CourseResponse[];

    if (userId) {
      courseResponses = await Promise.all(
        courses.map(async (course) => {
          const [isLiked, isBookmarked] = await Promise.all([
            this.courseLikeRepository.existsByUserIdAndCourseId(userId, course.id),
            this.courseBookmarkRepository.existsByUserIdAndCourseId(userId, course.id),
          ]);
          const response = this.mapToCourseResponse(course);
          response.isLiked = isLiked;
          response.isBookmarked = isBookmarked;
          return response;
        }),
      );
    } else {
      courseResponses = courses.map((course) => this.mapToCourseResponse(course));
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
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      viewCount: course.viewCount,
      nights: course.nights,
      days: course.days,
      likeCount: course.likeCount,
      bookmarkCount: course.bookmarkCount,
      userId: course.user.id,
      userName: course.user.name,
      countries: course.courseCountries?.map((cc) => cc.country.name) || [],
      hashTags: course.hashTags?.map((ht) => ht.tagName) || [],
      places: [...(course.courseDays || [])]
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .flatMap((cd) => [...(cd.coursePlaces || [])].sort((a, b) => a.visitOrder - b.visitOrder))
        .map((cp) => CoursePlaceResponse.fromEntity(cp)),
      isPublic: course.isPublic,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
