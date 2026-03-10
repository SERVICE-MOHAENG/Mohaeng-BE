import { Injectable } from '@nestjs/common';
import { CourseLikeRepository } from '../../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../../blog/persistence/BlogLikeRepository';
import { RegionLikeRepository } from '../../country/persistence/RegionLikeRepository';
import { CourseResponse } from '../../course/presentation/dto/response/CourseResponse';
import { BlogResponse } from '../../blog/presentation/dto/response/BlogResponse';
import { LikedRegionResponse } from '../../country/presentation/dto/response/LikedRegionResponse';
import { MyLikesResponse } from '../presentation/dto/response/MyLikesResponse';

@Injectable()
export class UserLikeService {
  constructor(
    private readonly courseLikeRepository: CourseLikeRepository,
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly regionLikeRepository: RegionLikeRepository,
  ) {}

  async getMyLikesOverview(
    userId: string,
    limit: number = 10,
  ): Promise<MyLikesResponse> {
    const safeLimit = Math.max(1, Math.min(20, limit));

    const [
      [courseLikes, totalCourses],
      [blogLikes, totalBlogs],
      [regionLikes, totalRegions],
    ] = await Promise.all([
      this.courseLikeRepository.findByUserId(userId, 1, safeLimit),
      this.blogLikeRepository.findByUserId(userId, 1, safeLimit),
      this.regionLikeRepository.findByUserId(userId, 1, safeLimit),
    ]);

    const regionIds = regionLikes.map((like) => like.regionId);
    const regionLikeCounts =
      await this.regionLikeRepository.countByRegionIds(regionIds);

    return {
      likedCourses: {
        items: courseLikes.map((like) => {
          const response = CourseResponse.fromEntity(like.travelCourse);
          response.isLiked = true;
          return response;
        }),
        total: totalCourses,
      },
      likedBlogs: {
        items: blogLikes.map((like) => {
          const response = BlogResponse.fromEntityWithUser(like.travelBlog);
          response.isLiked = true;
          return response;
        }),
        total: totalBlogs,
      },
      likedRegions: {
        items: regionLikes.map((like) =>
          LikedRegionResponse.fromRegion(
            like.region,
            regionLikeCounts[like.regionId] ?? 0,
            true,
          ),
        ),
        total: totalRegions,
      },
    };
  }
}
