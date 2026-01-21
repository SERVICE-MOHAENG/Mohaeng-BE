import { Injectable } from '@nestjs/common';
import { TravelBlogRepository } from '../persistence/TravelBlogRepository';
import { TravelBlog } from '../entity/TravelBlog.entity';
import { BlogNotFoundException } from '../exception/BlogNotFoundException';
import { BlogAccessDeniedException } from '../exception/BlogAccessDeniedException';
import { User } from '../../user/entity/User.entity';
import { BlogsResponse } from '../presentation/dto/response/BlogsResponse';
import { BlogResponse } from '../presentation/dto/response/BlogResponse';
import { BlogSortType } from '../presentation/dto/request/GetBlogsRequest';
import { CreateBlogRequest } from '../presentation/dto/request/CreateBlogRequest';
import { UpdateBlogRequest } from '../presentation/dto/request/UpdateBlogRequest';

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
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.travelBlogRepository.findByUserId(userId, page, limit);
  }

  /**
   * 공개 여행 블로그 목록 조회
   */
  async findPublicBlogs(
    page: number = 1,
    limit: number = 6,
  ): Promise<[TravelBlog[], number]> {
    return this.travelBlogRepository.findPublicBlogs(page, limit);
  }

  /**
   * 여행 블로그 생성 (레거시)
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
   * 여행 블로그 생성 (새로운 메서드)
   */
  async createBlog(
    userId: string,
    request: CreateBlogRequest,
  ): Promise<TravelBlog> {
    const user = new User();
    user.id = userId;

    const blog = TravelBlog.create(
      request.title,
      request.content,
      user,
      request.imageUrl,
      request.isPublic ?? false,
    );
    return this.travelBlogRepository.save(blog);
  }

  /**
   * 여행 블로그 수정
   */
  async update(
    blogId: string,
    userId: string,
    request: UpdateBlogRequest,
  ): Promise<TravelBlog> {
    const blog = await this.findById(blogId);

    // 소유권 검증
    if (blog.user.id !== userId) {
      throw new BlogAccessDeniedException();
    }

    // 필드별 업데이트
    if (request.title !== undefined) {
      blog.title = request.title;
    }
    if (request.content !== undefined) {
      blog.content = request.content;
    }
    if (request.imageUrl !== undefined) {
      blog.imageUrl = request.imageUrl;
    }
    if (request.isPublic !== undefined) {
      blog.isPublic = request.isPublic;
    }

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
   * 여행 블로그 삭제 (소유권 검증 포함)
   */
  async delete(blogId: string, userId: string): Promise<void> {
    const blog = await this.findById(blogId);

    // 소유권 검증
    if (blog.user.id !== userId) {
      throw new BlogAccessDeniedException();
    }

    await this.travelBlogRepository.delete(blog.id);
  }

  /**
   * 여행 블로그 목록 조회 (메인페이지용)
   * @description
   * - 정렬 기준에 따라 공개 블로그 조회
   * - latest: 최신순 (createdAt DESC)
   * - popular: 인기순 (likeCount DESC)
   * @param sortBy - 정렬 기준
   * @param page - 페이지 번호
   * @param limit - 페이지 크기
   * @returns BlogsResponse
   */
  async getBlogs(
    sortBy: BlogSortType = BlogSortType.LATEST,
    page: number = 1,
    limit: number = 6,
  ): Promise<BlogsResponse> {
    const [blogs, total] =
      sortBy === BlogSortType.LATEST
        ? await this.travelBlogRepository.findBlogsByLatest(page, limit)
        : await this.travelBlogRepository.findBlogsByPopular(page, limit);

    const blogResponses: BlogResponse[] = blogs.map((blog) =>
      BlogResponse.fromEntityWithUser(blog),
    );

    return {
      blogs: blogResponses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
