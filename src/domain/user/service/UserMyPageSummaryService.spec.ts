import { UserMyPageSummaryService } from './UserMyPageSummaryService';
import { UserNotFoundException } from '../exception/UserNotFoundException';

describe('UserMyPageSummaryService', () => {
  it('returns profile and stats using count queries only', async () => {
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-id',
        name: '김풍풍',
        email: 'kim@example.com',
        profileImage: null,
        visitedCountries: 16,
      }),
    };
    const travelCourseRepository = {
      countByUserId: jest.fn().mockResolvedValue(8),
      findByUserId: jest.fn(),
    };
    const travelBlogRepository = {
      countByUserId: jest.fn().mockResolvedValue(8),
      findByUserId: jest.fn(),
    };
    const regionLikeRepository = {
      countByUserId: jest.fn().mockResolvedValue(12),
      findByUserId: jest.fn(),
    };

    const service = new UserMyPageSummaryService(
      userRepository as any,
      travelCourseRepository as any,
      travelBlogRepository as any,
      regionLikeRepository as any,
    );

    await expect(service.getSummary('user-id')).resolves.toEqual({
      profile: {
        id: 'user-id',
        name: '김풍풍',
        email: 'kim@example.com',
        profileImage: null,
      },
      stats: {
        createdRoadmaps: 8,
        visitedCountries: 16,
        writtenBlogs: 8,
        likedRegions: 12,
      },
    });

    expect(travelCourseRepository.countByUserId).toHaveBeenCalledWith('user-id');
    expect(travelBlogRepository.countByUserId).toHaveBeenCalledWith('user-id');
    expect(regionLikeRepository.countByUserId).toHaveBeenCalledWith('user-id');
    expect(travelCourseRepository.findByUserId).not.toHaveBeenCalled();
    expect(travelBlogRepository.findByUserId).not.toHaveBeenCalled();
    expect(regionLikeRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('throws when the user does not exist', async () => {
    const service = new UserMyPageSummaryService(
      { findById: jest.fn().mockResolvedValue(null) } as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect(service.getSummary('missing-user')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });
});
