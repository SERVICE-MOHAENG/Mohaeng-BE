import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../../course/persistence/TravelCourseRepository';
import { TravelBlogRepository } from '../../blog/persistence/TravelBlogRepository';
import { CourseLikeRepository } from '../../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../../blog/persistence/BlogLikeRepository';
import { RegionLikeRepository } from '../../country/persistence/RegionLikeRepository';
import { MyPageLikedRegionsResponse, MyPageRegionCardResponse } from '../presentation/dto/response/MyPageLikedRegionsResponse';
import { BlogsResponse } from '../../blog/presentation/dto/response/BlogsResponse';
import { BlogResponse } from '../../blog/presentation/dto/response/BlogResponse';
import { BlogLikesResponse } from '../../blog/presentation/dto/response/BlogLikesResponse';
import { MyRoadmapListResponse } from '../presentation/dto/response/MyRoadmapListResponse';
import { RoadmapListResponse } from '../../course/presentation/dto/response/RoadmapListResponse';

@Injectable()
export class UserMyPageContentService {
  constructor(
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly courseLikeRepository: CourseLikeRepository,
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly regionLikeRepository: RegionLikeRepository,
  ) {}

  async getMyRoadmaps(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<MyRoadmapListResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [courses, total] = await this.travelCourseRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );
    const likedCourseIds = await this.courseLikeRepository.findLikedCourseIds(
      userId,
      courses.map((course) => course.id),
    );

    return MyRoadmapListResponse.from(
      courses,
      total,
      safePage,
      safeLimit,
      likedCourseIds,
    );
  }

  async getMyBlogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BlogsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [blogs, total] = await this.travelBlogRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );
    const likedBlogIds = await this.blogLikeRepository.findLikedBlogIds(
      userId,
      blogs.map((blog) => blog.id),
    );
    const blogsWithStatus = blogs.map((blog) =>
      BlogResponse.fromEntityWithUserStatus(blog, likedBlogIds.has(blog.id)),
    );

    return {
      blogs: blogsWithStatus,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getLikedRoadmaps(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<RoadmapListResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.courseLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );
    const courses = likes.map((like) => like.travelCourse);

    return RoadmapListResponse.from(
      courses,
      total,
      safePage,
      safeLimit,
      new Set(courses.map((course) => course.id)),
    );
  }

  async getLikedBlogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BlogLikesResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.blogLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    return BlogLikesResponse.from(likes, total, safePage, safeLimit);
  }

  async getLikedRegions(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<MyPageLikedRegionsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.regionLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );
    const regionIds = likes.map((like) => like.regionId);
    const likeCounts = await this.regionLikeRepository.countByRegionIds(regionIds);

    const items = likes.map((like) =>
      MyPageRegionCardResponse.fromRegion(
        like.region,
        likeCounts[like.regionId] ?? 0,
        true,
      ),
    );

    return MyPageLikedRegionsResponse.from(items, total, safePage, safeLimit);
  }

  private normalizePagination(page: number = 1, limit: number = 10) {
    return {
      safePage: Math.max(1, page),
      safeLimit: Math.max(1, Math.min(20, limit)),
    };
  }
}
