import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CourseLikeRepository } from '../persistence/CourseLikeRepository';
import { TravelCourseRepository } from '../persistence/TravelCourseRepository';
import { CourseLike } from '../entity/CourseLike.entity';
import { TravelCourse } from '../entity/TravelCourse.entity';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';

/**
 * CourseLike Service
 * @description
 * - 여행 코스 좋아요 비즈니스 로직
 */
@Injectable()
export class CourseLikeService {
  constructor(
    private readonly courseLikeRepository: CourseLikeRepository,
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 좋아요 토글
   * @description
   * - 좋아요가 존재하면 삭제 (좋아요 취소)
   * - 좋아요가 없으면 생성 (좋아요 추가)
   * - TravelCourse의 likeCount 업데이트
   * - 트랜잭션으로 Race Condition 방지
   */
  async toggleLike(
    userId: string,
    courseId: string,
  ): Promise<{ liked: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(TravelCourse);
      const likeRepo = manager.getRepository(CourseLike);

      // 코스 존재 확인 (비관적 락 적용)
      const course = await courseRepo.findOne({
        where: { id: courseId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!course) {
        throw new CourseNotFoundException();
      }

      // 기존 좋아요 확인
      const existingLike = await likeRepo.findOne({
        where: {
          user: { id: userId },
          travelCourse: { id: courseId },
        },
      });

      if (existingLike) {
        // 좋아요 삭제 및 카운트 감소
        await likeRepo.delete({ id: existingLike.id });
        course.decrementLikeCount();
        await courseRepo.save(course);
        return { liked: false };
      } else {
        // 좋아요 생성 및 카운트 증가
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new UserNotFoundException();
        }

        const like = CourseLike.create(course, user);
        await likeRepo.save(like);
        course.incrementLikeCount();
        await courseRepo.save(course);
        return { liked: true };
      }
    });
  }

  /**
   * 내 좋아요 목록 조회
   */
  async getMyLikes(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[CourseLike[], number]> {
    return this.courseLikeRepository.findByUserId(userId, page, limit);
  }

  /**
   * 좋아요 여부 확인
   */
  async isLiked(userId: string, courseId: string): Promise<boolean> {
    return this.courseLikeRepository.existsByUserIdAndCourseId(
      userId,
      courseId,
    );
  }
}
