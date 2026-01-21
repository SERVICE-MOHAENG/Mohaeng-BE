import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogLike } from '../entity/BlogLike.entity';

/**
 * BlogLike Repository
 * @description
 * - 여행 블로그 좋아요 데이터 접근 계층
 */
@Injectable()
export class BlogLikeRepository {
  constructor(
    @InjectRepository(BlogLike)
    private readonly repository: Repository<BlogLike>,
  ) {}

  /**
   * 사용자 ID와 블로그 ID로 좋아요 조회
   */
  async findByUserIdAndBlogId(
    userId: string,
    blogId: string,
  ): Promise<BlogLike | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        travelBlog: { id: blogId },
      },
      relations: ['user', 'travelBlog'],
    });
  }

  /**
   * 사용자의 좋아요 목록 조회 (페이지네이션)
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<[BlogLike[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['travelBlog', 'travelBlog.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 좋아요 저장
   */
  async save(like: BlogLike): Promise<BlogLike> {
    return this.repository.save(like);
  }

  /**
   * 좋아요 삭제
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * 좋아요 존재 여부 확인
   */
  async existsByUserIdAndBlogId(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        user: { id: userId },
        travelBlog: { id: blogId },
      },
    });
    return count > 0;
  }
}
