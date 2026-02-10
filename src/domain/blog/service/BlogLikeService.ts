import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BlogLikeRepository } from '../persistence/BlogLikeRepository';
import { TravelBlogRepository } from '../persistence/TravelBlogRepository';
import { BlogLike } from '../entity/BlogLike.entity';
import { TravelBlog } from '../entity/TravelBlog.entity';
import { BlogNotFoundException } from '../exception/BlogNotFoundException';
import { BlogAccessDeniedException } from '../exception/BlogAccessDeniedException';
import { BlogLikeAlreadyExistsException } from '../exception/BlogLikeAlreadyExistsException';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';

/**
 * BlogLike Service
 * @description
 * - 여행 블로그 좋아요 비즈니스 로직
 */
@Injectable()
export class BlogLikeService {
  constructor(
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 좋아요 추가
   * @description
   * - 좋아요가 이미 존재하면 409 Conflict
   * - TravelBlog의 likeCount 증가
   * - 트랜잭션으로 Race Condition 방지
   */
  async addLike(userId: string, blogId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const blogRepo = manager.getRepository(TravelBlog);
      const likeRepo = manager.getRepository(BlogLike);

      // 블로그 존재 확인 (비관적 락 적용)
      const blog = await blogRepo.findOne({
        where: { id: blogId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!blog) {
        throw new BlogNotFoundException();
      }
      if (!blog.isPublic && blog.user.id !== userId) {
        throw new BlogAccessDeniedException();
      }

      // 기존 좋아요 확인
      const existingLike = await likeRepo.findOne({
        where: {
          user: { id: userId },
          travelBlog: { id: blogId },
        },
      });

      if (existingLike) {
        throw new BlogLikeAlreadyExistsException();
      }

      // 좋아요 생성 및 카운트 증가
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      const like = BlogLike.create(blog, user);
      await likeRepo.save(like);
      blog.incrementLikeCount();
      await blogRepo.save(blog);
    });
  }

  /**
   * 좋아요 삭제
   * @description
   * - 좋아요가 없어도 멱등성 보장 (204 반환)
   * - TravelBlog의 likeCount 감소
   * - 트랜잭션으로 Race Condition 방지
   */
  async removeLike(userId: string, blogId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const blogRepo = manager.getRepository(TravelBlog);
      const likeRepo = manager.getRepository(BlogLike);

      // 블로그 존재 확인 (비관적 락 적용)
      const blog = await blogRepo.findOne({
        where: { id: blogId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!blog) {
        throw new BlogNotFoundException();
      }
      if (!blog.isPublic && blog.user.id !== userId) {
        throw new BlogAccessDeniedException();
      }

      // 기존 좋아요 확인
      const existingLike = await likeRepo.findOne({
        where: {
          user: { id: userId },
          travelBlog: { id: blogId },
        },
      });

      // 멱등성 보장: 좋아요가 없으면 그냥 리턴
      if (!existingLike) {
        return;
      }

      // 좋아요 삭제 및 카운트 감소
      await likeRepo.delete({ id: existingLike.id });
      blog.decrementLikeCount();
      await blogRepo.save(blog);
    });
  }

  /**
   * 내 좋아요 목록 조회
   */
  async getMyLikes(
    userId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<[BlogLike[], number]> {
    return this.blogLikeRepository.findByUserId(userId, page, limit);
  }

  /**
   * 좋아요 여부 확인
   */
  async isLiked(userId: string, blogId: string): Promise<boolean> {
    return this.blogLikeRepository.existsByUserIdAndBlogId(userId, blogId);
  }
}
