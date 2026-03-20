import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelCourseRepository } from '../../course/persistence/TravelCourseRepository';
import { TravelBlogRepository } from '../../blog/persistence/TravelBlogRepository';
import { CourseLikeRepository } from '../../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../../blog/persistence/BlogLikeRepository';
import { RegionLikeRepository } from '../../country/persistence/RegionLikeRepository';
import { MyPageLikedRegionsResponse, MyPageRegionCardResponse } from '../presentation/dto/response/MyPageLikedRegionsResponse';
import { CourseDetailListResponse } from '../../course/presentation/dto/response/CourseDetailListResponse';
import { CourseLikesResponse } from '../../course/presentation/dto/response/CourseLikesResponse';
import { ItineraryJob, ItineraryJobType } from '../../itinerary/entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../itinerary/entity/ItineraryStatus.enum';
import { BlogsResponse } from '../../blog/presentation/dto/response/BlogsResponse';
import { BlogResponse } from '../../blog/presentation/dto/response/BlogResponse';
import { BlogLikesResponse } from '../../blog/presentation/dto/response/BlogLikesResponse';

@Injectable()
export class UserMyPageContentService {
  constructor(
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly courseLikeRepository: CourseLikeRepository,
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly regionLikeRepository: RegionLikeRepository,
    @InjectRepository(ItineraryJob)
    private readonly itineraryJobRepository: Repository<ItineraryJob>,
  ) {}

  async getMyRoadmaps(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CourseDetailListResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [courses, total] = await this.travelCourseRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );
    const latestGenerationJobs = await this.findLatestGenerationJobsByCourseIds(
      courses.map((course) => course.id),
    );

    return CourseDetailListResponse.from(
      courses,
      total,
      safePage,
      safeLimit,
      latestGenerationJobs,
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
  ): Promise<CourseLikesResponse> {
    const { safePage, safeLimit } = this.normalizePagination(page, limit);
    const [likes, total] = await this.courseLikeRepository.findByUserId(
      userId,
      safePage,
      safeLimit,
    );

    return CourseLikesResponse.from(likes, total, safePage, safeLimit);
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

  private async findLatestGenerationJobsByCourseIds(
    courseIds: string[],
  ): Promise<Map<string, ItineraryJob>> {
    if (courseIds.length === 0) {
      return new Map();
    }

    const jobs = await this.itineraryJobRepository.find({
      where: courseIds.map((courseId) => ({
        travelCourseId: courseId,
        status: ItineraryStatus.SUCCESS,
        jobType: ItineraryJobType.GENERATION,
      })),
      order: {
        completedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    const latestJobs = new Map<string, ItineraryJob>();

    for (const job of jobs) {
      if (!job.travelCourseId || latestJobs.has(job.travelCourseId)) {
        continue;
      }

      latestJobs.set(job.travelCourseId, job);
    }

    return latestJobs;
  }
}
