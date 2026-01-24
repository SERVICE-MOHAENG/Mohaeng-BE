import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CourseBookmarkRepository } from '../persistence/CourseBookmarkRepository';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseBookmark } from '../entity/CourseBookmark.entity';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { CourseBookmarkAlreadyExistsException } from '../exception/CourseBookmarkAlreadyExistsException';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { User } from '../../user/entity/User.entity';

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
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 북마크 추가
   * @description
   * - 북마크가 이미 존재하면 409 Conflict
   * - TravelCourse의 bookmarkCount 증가
   * - 트랜잭션으로 Race Condition 방지
   */
  async addBookmark(userId: string, courseId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(TravelCourse);
      const bookmarkRepo = manager.getRepository(CourseBookmark);

      // 코스 존재 확인 (비관적 락 적용)
      const course = await courseRepo.findOne({
        where: { id: courseId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!course) {
        throw new CourseNotFoundException();
      }
      if (!course.isPublic && course.user.id !== userId) {
        throw new CourseAccessDeniedException();
      }

      // 기존 북마크 확인
      const existingBookmark = await bookmarkRepo.findOne({
        where: {
          user: { id: userId },
          travelCourse: { id: courseId },
        },
      });

      //이미 북마크 한 경우 예외처리
      if (existingBookmark) {
        throw new CourseBookmarkAlreadyExistsException();
      }

      // 북마크 생성 및 카운트 증가
      const userRepo = manager.getRepository(User);
      let user: User | null = course.user;
      if (!user || user.id !== userId) {
        user = await userRepo.findOne({ where: { id: userId } });
      }
      if (!user) {
        throw new UserNotFoundException();
      }

      const bookmark = CourseBookmark.create(course, user);
      await bookmarkRepo.save(bookmark);
      course.incrementBookmarkCount();
      await courseRepo.save(course);
    });
  }

  /**
   * 북마크 삭제
   * @description
   * - 북마크가 없어도 멱등성 보장 (204 반환)
   * - TravelCourse의 bookmarkCount 감소
   * - 트랜잭션으로 Race Condition 방지
   */
  async removeBookmark(userId: string, courseId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(TravelCourse);
      const bookmarkRepo = manager.getRepository(CourseBookmark);

      // 기존 북마크 확인
      const existingBookmark = await bookmarkRepo.findOne({
        where: {
          user: { id: userId },
          travelCourse: { id: courseId },
        },
      });

      // 멱등성 보장: 북마크가 없으면 그냥 리턴
      if (!existingBookmark) {
        // 코스 존재 확인 (비관적 락 적용)
        const course = await courseRepo.findOne({
          where: { id: courseId },
          relations: ['user'],
          lock: { mode: 'pessimistic_write' },
        });
        if (!course) {
          throw new CourseNotFoundException();
        }
        if (!course.isPublic && course.user.id !== userId) {
          throw new CourseAccessDeniedException();
        }
        return;
      }

      // 북마크 삭제 및 카운트 감소
      await bookmarkRepo.delete({ id: existingBookmark.id });
      const course = await courseRepo.findOne({
        where: { id: courseId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (course) {
        course.decrementBookmarkCount();
        await courseRepo.save(course);
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
