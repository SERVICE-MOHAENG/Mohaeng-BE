import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelBlog } from '../entity/TravelBlog.entity';

/**
 * TravelBlog Repository
 * @description
 * - 여행 블로그 정보 데이터 접근 계층
 */
@Injectable()
export class TravelBlogRepository {
  constructor(
    @InjectRepository(TravelBlog)
    private readonly repository: Repository<TravelBlog>,
  ) {}

  async findById(id: string): Promise<TravelBlog | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'likes'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['likes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicBlogs(
    page: number = 1,
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { isPublic: true },
      relations: ['user', 'likes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async save(blog: TravelBlog): Promise<TravelBlog> {
    return this.repository.save(blog);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * 공개 여행 블로그 조회 (최신순 - 메인페이지용)
   * @param page - 페이지 번호
   * @param limit - 페이지 크기
   * @returns [TravelBlog[], total]
   */
  async findBlogsByLatest(
    page: number = 1,
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { isPublic: true },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 공개 여행 블로그 조회 (인기순 - 좋아요 순, 메인페이지용)
   * @param page - 페이지 번호
   * @param limit - 페이지 크기
   * @returns [TravelBlog[], total]
   */
  async findBlogsByPopular(
    page: number = 1,
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { isPublic: true },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        likeCount: 'DESC',
        createdAt: 'DESC',
      },
    });
  }
}
