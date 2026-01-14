import { Injectable } from '@nestjs/common';
import { TravelBlogRepository } from '../persistence/TravelBlogRepository';
import { TravelBlog } from '../entity/TravelBlog.entity';
import { BlogNotFoundException } from '../exception/BlogNotFoundException';
import { User } from '../../user/entity/User.entity';

/**
 * TravelBlog Service
 * @description
 * - 여행 블로그 도메인 비즈니스 로직
 */
@Injectable()
export class TravelBlogService {
  constructor(private readonly travelBlogRepository: TravelBlogRepository) {}

  /**
   * ID로 여행 블로그 조회
   */
  async findById(id: string): Promise<TravelBlog> {
    const blog = await this.travelBlogRepository.findById(id);
    if (!blog) {
      throw new BlogNotFoundException();
    }
    return blog;
  }

  /**
   * 사용자 ID로 여행 블로그 목록 조회
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelBlog[], number]> {
    return this.travelBlogRepository.findByUserId(userId, page, limit);
  }

  /**
   * 공개 여행 블로그 목록 조회
   */
  async findPublicBlogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelBlog[], number]> {
    return this.travelBlogRepository.findPublicBlogs(page, limit);
  }

  /**
   * 여행 블로그 생성
   */
  async create(
    title: string,
    content: string,
    user: User,
    imageUrl?: string,
    isPublic: boolean = true,
  ): Promise<TravelBlog> {
    const blog = TravelBlog.create(title, content, user, imageUrl, isPublic);
    return this.travelBlogRepository.save(blog);
  }

  /**
   * 여행 블로그 조회수 증가
   */
  async incrementViewCount(id: string): Promise<TravelBlog> {
    const blog = await this.findById(id);
    blog.incrementViewCount();
    return this.travelBlogRepository.save(blog);
  }

  /**
   * 여행 블로그 삭제
   */
  async delete(id: string): Promise<void> {
    const blog = await this.findById(id);
    await this.travelBlogRepository.delete(blog.id);
  }
}
