import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';

/**
 * TravelCourse Service
 * @description
 * - 여행 코스 도메인 비즈니스 로직
 */
@Injectable()
export class TravelCourseService {
  constructor(
    private readonly travelCourseRepository: TravelCourseRepository,
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
   * 여행 코스 생성
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
   * 여행 코스 조회수 증가
   */
  async incrementViewCount(id: string): Promise<TravelCourse> {
    const course = await this.findById(id);
    course.incrementViewCount();
    return this.travelCourseRepository.save(course);
  }

  /**
   * 여행 코스 삭제
   */
  async delete(id: string): Promise<void> {
    const course = await this.findById(id);
    await this.travelCourseRepository.delete(course.id);
  }
}
