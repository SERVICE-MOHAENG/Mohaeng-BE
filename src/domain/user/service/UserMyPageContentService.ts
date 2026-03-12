import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../../course/persistence/TravelCourseRepository';
import { TravelBlogRepository } from '../../blog/persistence/TravelBlogRepository';
import { CourseLikeRepository } from '../../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../../blog/persistence/BlogLikeRepository';
import { RegionLikeRepository } from '../../country/persistence/RegionLikeRepository';
import { MyPageRoadmapCardResponse, MyPageRoadmapsResponse } from '../presentation/dto/response/MyPageRoadmapsResponse';
import { MyPageBlogCardResponse, MyPageBlogsResponse } from '../presentation/dto/response/MyPageBlogsResponse';
import { MyPageLikedRegionsResponse, MyPageRegionCardResponse } from '../presentation/dto/response/MyPageLikedRegionsResponse';

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
  ): Promise<MyPageRoadmapsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [courses, total] = await this.travelCourseRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    const items = await Promise.all(
      courses.map(async (course) =>
        MyPageRoadmapCardResponse.fromEntity(
          course,
          await this.courseLikeRepository.existsByUserIdAndCourseId(
            userId,
            course.id,
          ),
        ),
      ),
    );

    return MyPageRoadmapsResponse.from(items, total, safePage, safeLimit);
  }

  async getMyBlogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<MyPageBlogsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [blogs, total] = await this.travelBlogRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    const items = await Promise.all(
      blogs.map(async (blog) =>
        MyPageBlogCardResponse.fromEntity(
          blog,
          await this.blogLikeRepository.existsByUserIdAndBlogId(userId, blog.id),
        ),
      ),
    );

    return MyPageBlogsResponse.from(items, total, safePage, safeLimit);
  }

  async getLikedRoadmaps(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<MyPageRoadmapsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.courseLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    const items = likes.map((like) =>
      MyPageRoadmapCardResponse.fromEntity(like.travelCourse, true),
    );

    return MyPageRoadmapsResponse.from(items, total, safePage, safeLimit);
  }

  async getLikedBlogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<MyPageBlogsResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.blogLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    const items = likes.map((like) =>
      MyPageBlogCardResponse.fromEntity(like.travelBlog, true),
    );

    return MyPageBlogsResponse.from(items, total, safePage, safeLimit);
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
