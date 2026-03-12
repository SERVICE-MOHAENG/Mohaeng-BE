import { Injectable } from '@nestjs/common';
import { TravelCourseRepository } from '../../course/persistence/TravelCourseRepository';
import { TravelBlogRepository } from '../../blog/persistence/TravelBlogRepository';
import { RegionLikeRepository } from '../../country/persistence/RegionLikeRepository';
import { UserNotFoundException } from '../exception/UserNotFoundException';
import { UserRepository } from '../persistence/UserRepository';
import { MyPageSummaryResponse } from '../presentation/dto/response/MyPageSummaryResponse';

@Injectable()
export class UserMyPageSummaryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly travelCourseRepository: TravelCourseRepository,
    private readonly travelBlogRepository: TravelBlogRepository,
    private readonly regionLikeRepository: RegionLikeRepository,
  ) {}

  async getSummary(userId: string): Promise<MyPageSummaryResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const [createdRoadmaps, writtenBlogs, likedRegions] = await Promise.all([
      this.travelCourseRepository.countByUserId(userId),
      this.travelBlogRepository.countByUserId(userId),
      this.regionLikeRepository.countByUserId(userId),
    ]);

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage ?? null,
      },
      stats: {
        createdRoadmaps,
        visitedCountries: user.visitedCountries,
        writtenBlogs,
        likedRegions,
      },
    };
  }
}
