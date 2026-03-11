import { UserMyPageService } from './UserMyPageService';

describe('UserMyPageService', () => {
  it('aggregates profile, stats, roadmaps, blogs, and likes into one response', async () => {
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-id',
        name: '홍길동',
        email: 'hong@example.com',
        profileImage: null,
      }),
    };

    const travelCourseRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            id: 'course-id',
            title: '내 로드맵',
            description: '설명',
            imageUrl: null,
            viewCount: 0,
            nights: 1,
            days: 2,
            likeCount: 3,
            modificationCount: 0,
            user: { id: 'user-id', name: '홍길동' },
            courseCountries: [],
            courseRegions: [],
            hashTags: [],
            courseDays: [],
            isPublic: false,
            createdAt: new Date('2026-03-11T00:00:00.000Z'),
            updatedAt: new Date('2026-03-11T00:00:00.000Z'),
            sourceCourseId: null,
          },
        ],
        4,
      ]),
    };

    const travelBlogRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            id: 'blog-id',
            title: '내 블로그',
            content: '본문',
            imageUrl: null,
            isPublic: true,
            viewCount: 10,
            likeCount: 2,
            createdAt: new Date('2026-03-11T00:00:00.000Z'),
            updatedAt: new Date('2026-03-11T00:00:00.000Z'),
            user: { id: 'user-id', name: '홍길동' },
          },
        ],
        7,
      ]),
    };

    const courseLikeRepository = {
      existsByUserIdAndCourseId: jest.fn().mockResolvedValue(true),
    };

    const blogLikeRepository = {
      existsByUserIdAndBlogId: jest.fn().mockResolvedValue(false),
    };

    const userLikeService = {
      getMyLikesOverview: jest.fn().mockResolvedValue({
        likedCourses: { items: [], total: 1 },
        likedBlogs: { items: [], total: 2 },
        likedRegions: { items: [], total: 3 },
      }),
    };

    const service = new UserMyPageService(
      userRepository as any,
      travelCourseRepository as any,
      travelBlogRepository as any,
      courseLikeRepository as any,
      blogLikeRepository as any,
      userLikeService as any,
    );

    const result = await service.getMyPageOverview('user-id', 5);

    expect(result.profile).toEqual({
      id: 'user-id',
      name: '홍길동',
      email: 'hong@example.com',
      profileImage: null,
    });
    expect(result.stats).toEqual({
      totalTrips: 4,
      writtenBlogs: 7,
      likedRegions: 3,
    });
    expect(result.myRoadmaps.total).toBe(4);
    expect(result.myRoadmaps.items[0].isLiked).toBe(true);
    expect(result.myBlogs.total).toBe(7);
    expect(result.myBlogs.items[0].isLiked).toBe(false);
    expect(result.likes.likedRegions.total).toBe(3);
  });
});
