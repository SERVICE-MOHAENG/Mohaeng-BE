import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const [pagedLikes, total] = await this.repository
      .createQueryBuilder('blogLike')
      .innerJoin('blogLike.user', 'user')
      .innerJoin('blogLike.travelBlog', 'travelBlog')
      .innerJoin('travelBlog.user', 'owner')
      .where('user.id = :userId', { userId })
      .andWhere('(travelBlog.isPublic = :isPublic OR owner.id = :userId)', {
        userId,
        isPublic: true,
      })
      .orderBy('blogLike.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const likeIds = pagedLikes.map((like) => like.id);
    if (likeIds.length === 0) {
      return [[], total];
    }

    const likes = await this.repository.find({
      where: { id: In(likeIds) },
      relations: [
        'travelBlog',
        'travelBlog.user',
        'travelBlog.travelCourse',
        'travelBlog.images',
        'travelBlog.hashTags',
      ],
      relationLoadStrategy: 'query',
    });

    const likesById = new Map(likes.map((like) => [like.id, like]));

    return [
      likeIds
        .map((likeId) => likesById.get(likeId))
        .filter((like): like is BlogLike => Boolean(like)),
      total,
    ];
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

  async findLikedBlogIds(
    userId: string,
    blogIds: string[],
  ): Promise<Set<string>> {
    const uniqueBlogIds = [...new Set(blogIds)];
    if (uniqueBlogIds.length === 0) {
      return new Set<string>();
    }

    const rows = await this.repository
      .createQueryBuilder('blogLike')
      .innerJoin('blogLike.travelBlog', 'travelBlog')
      .innerJoin('blogLike.user', 'user')
      .select('travelBlog.id', 'blogId')
      .where('user.id = :userId', { userId })
      .andWhere('travelBlog.id IN (:...blogIds)', { blogIds: uniqueBlogIds })
      .getRawMany<{ blogId: string }>();

    return new Set(rows.map((row) => row.blogId));
  }
}
