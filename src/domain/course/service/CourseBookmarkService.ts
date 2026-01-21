import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CourseBookmarkRepository } from '../persistence/CourseBookmarkRepository';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseBookmark } from '../entity/CourseBookmark.entity';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';

/**
 * CourseBookmark Service
 * @description
 * - 여행 코스 북마크 비즈니스 로직
 */
@Injectable()
export class CourseBookmarkService {
  constructor(
    private readonly courseBookmarkRepository: CourseBookmarkRepository,
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 북마크 토글
   * @description
   * - 북마크가 존재하면 삭제 (북마크 취소)
   * - 북마크가 없으면 생성 (북마크 추가)
   * - TravelCourse의 bookmarkCount 업데이트
   * - 트랜잭션으로 Race Condition 방지
   */
  async toggleBookmark(
    userId: string,
    courseId: string,
  ): Promise<{ bookmarked: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(TravelCourse);
      const bookmarkRepo = manager.getRepository(CourseBookmark);

      // 코스 존재 확인 (비관적 락 적용)
      const course = await courseRepo.findOne({
        where: { id: courseId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!course) {
        throw new CourseNotFoundException();
      }

      // 기존 북마크 확인
      const existingBookmark = await bookmarkRepo.findOne({
        where: {
          user: { id: userId },
          travelCourse: { id: courseId },
        },
      });

      if (existingBookmark) {
        // 북마크 삭제 및 카운트 감소
        await bookmarkRepo.delete({ id: existingBookmark.id });
        course.decrementBookmarkCount();
        await courseRepo.save(course);
        return { bookmarked: false };
      } else {
        // 북마크 생성 및 카운트 증가
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new UserNotFoundException();
        }

        const bookmark = CourseBookmark.create(course, user);
        await bookmarkRepo.save(bookmark);
        course.incrementBookmarkCount();
        await courseRepo.save(course);
        return { bookmarked: true };
      }
    });
  }

  /**
   * 내 북마크 목록 조회
   */
  async getMyBookmarks(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[CourseBookmark[], number]> {
    return this.courseBookmarkRepository.findByUserId(userId, page, limit);
  }

  /**
   * 북마크 여부 확인
   */
  async isBookmarked(userId: string, courseId: string): Promise<boolean> {
    return this.courseBookmarkRepository.existsByUserIdAndCourseId(
      userId,
      courseId,
    );
  }
}
