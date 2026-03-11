import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../../course/persistence/TravelCourseRepository';
import { TravelBlogRepository } from '../../blog/persistence/TravelBlogRepository';
import { CourseLikeRepository } from '../../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../../blog/persistence/BlogLikeRepository';
import { UserRepository } from '../persistence/UserRepository';
import { UserNotFoundException } from '../exception/UserNotFoundException';
import { UserLikeService } from './UserLikeService';
import { MyPageOverviewResponse } from '../presentation/dto/response/MyPageOverviewResponse';
import { CourseResponse } from '../../course/presentation/dto/response/CourseResponse';
import { BlogResponse } from '../../blog/presentation/dto/response/BlogResponse';

@Injectable()
export class UserMyPageService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly courseLikeRepository: CourseLikeRepository,
    private readonly blogLikeRepository: BlogLikeRepository,
    private readonly userLikeService: UserLikeService,
  ) {}

  async getMyPageOverview(
    userId: string,
    limit: number = 10,
  ): Promise<MyPageOverviewResponse> {
    const safeLimit = Math.max(1, Math.min(20, limit));

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const [[courses, totalCourses], [blogs, totalBlogs], likes] =
      await Promise.all([
        this.travelCourseRepository.findByUserId(userId, 1, safeLimit),
        this.travelBlogRepository.findByUserId(userId, 1, safeLimit),
        this.userLikeService.getMyLikesOverview(userId, safeLimit),
      ]);

    const [roadmapItems, blogItems] = await Promise.all([
      Promise.all(
        courses.map(async (course) => {
          const isLiked =
            await this.courseLikeRepository.existsByUserIdAndCourseId(
              userId,
              course.id,
            );
          return CourseResponse.fromEntityWithUserStatus(course, isLiked);
        }),
      ),
      Promise.all(
        blogs.map(async (blog) => {
          const isLiked =
            await this.blogLikeRepository.existsByUserIdAndBlogId(
              userId,
              blog.id,
            );
          return BlogResponse.fromEntityWithUserStatus(blog, isLiked);
        }),
      ),
    ]);

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage ?? null,
      },
      stats: {
        totalTrips: totalCourses,
        visitedCountries: user.visitedCountries,
        writtenBlogs: totalBlogs,
        likedRegions: likes.likedRegions.total,
      },
      myRoadmaps: {
        items: roadmapItems,
        total: totalCourses,
      },
      myBlogs: {
        items: blogItems,
        total: totalBlogs,
      },
      likes,
    };
  }
}
