import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CourseBookmark } from '../entity/CourseBookmark.entity';

/**
 * CourseBookmark Repository
 * @description
 * - 여행 코스 북마크 데이터 접근 계층
 */
@Injectable()
export class CourseBookmarkRepository {
  constructor(
    @InjectRepository(CourseBookmark)
    private readonly repository: Repository<CourseBookmark>,
  ) {}

  /**
   * 사용자 ID와 코스 ID로 북마크 조회
   */
  async findByUserIdAndCourseId(
    userId: string,
    courseId: string,
  ): Promise<CourseBookmark | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        travelCourse: { id: courseId },
      },
      relations: ['user', 'travelCourse'],
    });
  }

  /**
   * 사용자의 북마크 목록 조회 (페이지네이션)
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[CourseBookmark[], number]> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const baseOptions = {
      where: { user: { id: userId } },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: { createdAt: 'DESC' as const },
    };

    try {
      return await this.repository.findAndCount({
        ...baseOptions,
        relations: [
          'travelCourse',
          'travelCourse.user',
          'travelCourse.courseCountries',
          'travelCourse.courseCountries.country',
          'travelCourse.courseDays',
          'travelCourse.courseDays.coursePlaces',
          'travelCourse.courseDays.coursePlaces.place',
          'travelCourse.hashTags',
        ],
      });
    } catch (error) {
      if (!this.isMissingCourseDayIdError(error)) {
        throw error;
      }

      // Legacy Postgres schema fallback: load without coursePlaces relation.
      return this.repository.findAndCount({
        ...baseOptions,
        relations: [
          'travelCourse',
          'travelCourse.user',
          'travelCourse.courseCountries',
          'travelCourse.courseCountries.country',
          'travelCourse.courseDays',
          'travelCourse.hashTags',
        ],
      });
    }
  }

  private isMissingCourseDayIdError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const message = typeof error.message === 'string' ? error.message : '';
    return message.includes('course_day_id') && message.includes('does not exist');
  }

  /**
   * 북마크 저장
   */
  async save(bookmark: CourseBookmark): Promise<CourseBookmark> {
    return this.repository.save(bookmark);
  }

  /**
   * 북마크 삭제
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * 북마크 존재 여부 확인
   */
  async existsByUserIdAndCourseId(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        user: { id: userId },
        travelCourse: { id: courseId },
      },
    });
    return count > 0;
  }
}
