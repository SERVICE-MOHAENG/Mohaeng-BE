import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { CreateCourseRequest } from '../presentation/dto/request/CreateCourseRequest';
import { UpdateCourseRequest } from '../presentation/dto/request/UpdateCourseRequest';
import { CourseResponse } from '../presentation/dto/response/CourseResponse';
import { CoursesResponse } from '../presentation/dto/response/CoursesResponse';

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

    return {
      items: courses.map((course) => CourseResponse.fromEntity(course)),
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
}
