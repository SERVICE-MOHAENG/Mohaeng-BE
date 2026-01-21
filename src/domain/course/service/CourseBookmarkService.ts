import { Injectable } from '@nestjs/common';
import { CourseBookmarkRepository } from '../persistence/CourseBookmarkRepository';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseBookmark } from '../entity/CourseBookmark.entity';
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
  ) {}

  /**
   * 북마크 토글
   * @description
   * - 북마크가 존재하면 삭제 (북마크 취소)
   * - 북마크가 없으면 생성 (북마크 추가)
   * - TravelCourse의 bookmarkCount 업데이트
   */
  async toggleBookmark(
    userId: string,
    courseId: string,
  ): Promise<{ bookmarked: boolean }> {
    // 코스 존재 확인
    const course = await this.travelCourseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException();
    }

    // 기존 북마크 확인
    const existingBookmark =
      await this.courseBookmarkRepository.findByUserIdAndCourseId(
        userId,
        courseId,
      );

    if (existingBookmark) {
      // 북마크 삭제 및 카운트 감소
      await this.courseBookmarkRepository.delete(existingBookmark.id);
      course.decrementBookmarkCount();
      await this.travelCourseRepository.save(course);
      return { bookmarked: false };
    } else {
      // 북마크 생성 및 카운트 증가
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      const bookmark = CourseBookmark.create(course, user);
      await this.courseBookmarkRepository.save(bookmark);
      course.incrementBookmarkCount();
      await this.travelCourseRepository.save(course);
      return { bookmarked: true };
    }
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
