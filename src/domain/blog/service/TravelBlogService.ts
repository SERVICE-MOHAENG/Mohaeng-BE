import { Injectable } from '@nestjs/common';
import { TravelBlogRepository } from '../persistence/TravelBlogRepository';
import { BlogLikeRepository } from '../persistence/BlogLikeRepository';
import { TravelBlog } from '../entity/TravelBlog.entity';
import { BlogNotFoundException } from '../exception/BlogNotFoundException';
import { BlogAccessDeniedException } from '../exception/BlogAccessDeniedException';
import { User } from '../../user/entity/User.entity';
import { BlogsResponse } from '../presentation/dto/response/BlogsResponse';
import { BlogResponse } from '../presentation/dto/response/BlogResponse';
import { BlogSortType } from '../presentation/dto/request/GetBlogsRequest';
import { CreateBlogRequest } from '../presentation/dto/request/CreateBlogRequest';
import { UpdateBlogRequest } from '../presentation/dto/request/UpdateBlogRequest';
import { TravelCourseService } from '../../course/service/TravelCourseService';
import { CourseAccessDeniedException } from '../../course/exception/CourseAccessDeniedException';
import { BlogAlreadyExistsForRoadmapException } from '../exception/BlogAlreadyExistsForRoadmapException';
import { BlogRoadmapNotCompletedException } from '../exception/BlogRoadmapNotCompletedException';

/**
 * TravelBlog Service
 * @description
 * - 여행 블로그 도메인 비즈니스 로직
 */
@Injectable()
export class TravelBlogService {
  constructor(
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly travelCourseService: TravelCourseService,
  ) {}

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
   * ID로 여행 블로그 조회 (사용자 상태 포함)
   */
  async findByIdWithUserStatus(
    id: string,
    userId: string,
  ): Promise<BlogResponse> {
    const blog = await this.findById(id);

    // 비공개 블로그 접근 검증
    if (!blog.isPublic && blog.user.id !== userId) {
      throw new BlogAccessDeniedException();
    }

    const isLiked = await this.blogLikeRepository.existsByUserIdAndBlogId(
      userId,
      id,
    );

    return BlogResponse.fromEntityWithUserStatus(blog, isLiked);
  }

  async findByIdWithUserStatusAndIncrementViewCount(
    id: string,
    userId: string,
  ): Promise<BlogResponse> {
    const blog = await this.findById(id);

    if (!blog.isPublic && blog.user.id !== userId) {
      throw new BlogAccessDeniedException();
    }

    blog.incrementViewCount();
    const updatedBlog = await this.travelBlogRepository.save(blog);
    const isLiked = await this.blogLikeRepository.existsByUserIdAndBlogId(
      userId,
      id,
    );

    return BlogResponse.fromEntityWithUserStatus(updatedBlog, isLiked);
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
   * 내 블로그 목록 조회 (좋아요 상태 포함)
   */
  async getMyBlogs(
    userId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<BlogsResponse> {
    const [blogs, total] = await this.findByUserId(userId, page, limit);
    const blogResponses = await this.mapBlogsWithLikedStatus(blogs, userId);

    return {
      blogs: blogResponses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
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
    travelCourseId: string,
    imageUrls: string[] = [],
    tags: string[] = [],
    isPublic: boolean = true,
  ): Promise<TravelBlog> {
    const travelCourse =
      await this.travelCourseService.findById(travelCourseId);
    const blog = TravelBlog.create(
      title,
      content,
      user,
      travelCourse,
      imageUrls,
      tags,
      isPublic,
    );
    return this.travelBlogRepository.save(blog);
  }

  /**
   * 여행 블로그 생성 (새로운 메서드)
   */
  async createBlog(
    userId: string,
    request: CreateBlogRequest,
  ): Promise<TravelBlog> {
    const travelCourse = await this.travelCourseService.findById(
      request.travelCourseId,
    );

    if (travelCourse.user.id !== userId) {
      throw new CourseAccessDeniedException();
    }

    if (!travelCourse.isCompleted) {
      throw new BlogRoadmapNotCompletedException();
    }

    const alreadyExists =
      await this.travelBlogRepository.existsByTravelCourseId(
        request.travelCourseId,
      );
    if (alreadyExists) {
      throw new BlogAlreadyExistsForRoadmapException();
    }

    const imageUrls = (request.imageUrls || [])
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean);
    const tags = [...new Set((request.tags || []).map((tag) => tag.trim()))]
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

    // Hotfix: current client flow is expected to publish blogs to the main page.
    // Ignore client-provided false values until private blog support is wired end-to-end.
    const blog = TravelBlog.create(
      request.title,
      request.content,
      travelCourse.user,
      travelCourse,
      imageUrls,
      tags,
      true,
    );

    const savedBlog = await this.travelBlogRepository.save(blog);
    return this.findById(savedBlog.id);
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
   * - userId가 제공되면 좋아요 상태 포함
   * @param sortBy - 정렬 기준
   * @param page - 페이지 번호
   * @param limit - 페이지 크기
   * @param userId - 사용자 ID (선택)
   * @returns BlogsResponse
   */
  async getBlogs(
    sortBy: BlogSortType = BlogSortType.LATEST,
    page: number = 1,
    limit: number = 6,
    userId?: string,
  ): Promise<BlogsResponse> {
    const [blogs, total] =
      sortBy === BlogSortType.LATEST
        ? await this.travelBlogRepository.findBlogsByLatest(page, limit)
        : await this.travelBlogRepository.findBlogsByPopular(page, limit);

    let blogResponses: BlogResponse[];

    if (userId) {
      blogResponses = await this.mapBlogsWithLikedStatus(blogs, userId);
    } else {
      blogResponses = blogs.map((blog) =>
        BlogResponse.fromEntityWithUser(blog),
      );
    }

    return {
      blogs: blogResponses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async mapBlogsWithLikedStatus(
    blogs: TravelBlog[],
    userId: string,
  ): Promise<BlogResponse[]> {
    const likedBlogIds = await this.blogLikeRepository.findLikedBlogIds(
      userId,
      blogs.map((blog) => blog.id),
    );

    return blogs.map((blog) =>
      BlogResponse.fromEntityWithUserStatus(blog, likedBlogIds.has(blog.id)),
    );
  }
}
