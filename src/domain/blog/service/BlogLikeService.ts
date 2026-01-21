import { Injectable } from '@nestjs/common';
import { BlogLikeRepository } from '../persistence/BlogLikeRepository';
import { TravelBlogRepository } from '../persistence/TravelBlogRepository';
import { BlogLike } from '../entity/BlogLike.entity';
import { BlogNotFoundException } from '../exception/BlogNotFoundException';
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
  ) {}

  /**
   * 좋아요 토글
   * @description
   * - 좋아요가 존재하면 삭제 (좋아요 취소)
   * - 좋아요가 없으면 생성 (좋아요 추가)
   * - TravelBlog의 likeCount 업데이트
   */
  async toggleLike(
    userId: string,
    blogId: string,
  ): Promise<{ liked: boolean }> {
    // 블로그 존재 확인
    const blog = await this.travelBlogRepository.findById(blogId);
    if (!blog) {
      throw new BlogNotFoundException();
    }

    // 기존 좋아요 확인
    const existingLike = await this.blogLikeRepository.findByUserIdAndBlogId(
      userId,
      blogId,
    );

    if (existingLike) {
      // 좋아요 삭제 및 카운트 감소
      await this.blogLikeRepository.delete(existingLike.id);
      blog.decrementLikeCount();
      await this.travelBlogRepository.save(blog);
      return { liked: false };
    } else {
      // 좋아요 생성 및 카운트 증가
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException();
      }

      const like = BlogLike.create(blog, user);
      await this.blogLikeRepository.save(like);
      blog.incrementLikeCount();
      await this.travelBlogRepository.save(blog);
      return { liked: true };
    }
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
