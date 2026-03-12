import { UserMyPageContentService } from './UserMyPageContentService';

describe('UserMyPageContentService', () => {
  it('returns my roadmaps with normalized pagination and like state', async () => {
    const travelCourseRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            id: 'course-id',
            title: '시부야 밤거리',
            imageUrl: null,
            days: 1,
            nights: 0,
            hashTags: [{ tagName: '#당일치기' }, { tagName: '#친구' }],
            likeCount: 1002,
          },
        ],
        1,
      ]),
    };
    const service = new UserMyPageContentService(
      travelCourseRepository as any,
      {} as any,
      {
        existsByUserIdAndCourseId: jest.fn().mockResolvedValue(true),
      } as any,
      {} as any,
      {} as any,
    );

    await expect(service.getMyRoadmaps('user-id', 0, 99)).resolves.toEqual({
      items: [
        {
          id: 'course-id',
          title: '시부야 밤거리',
          imageUrl: null,
          days: 1,
          nights: 0,
          hashTags: ['#당일치기', '#친구'],
          likeCount: 1002,
          isLiked: true,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    expect(travelCourseRepository.findByUserId).toHaveBeenCalledWith(
      'user-id',
      1,
      20,
    );
  });

  it('returns liked blogs as fixed liked cards', async () => {
    const blogLikeRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            travelBlog: {
              id: 'blog-id',
              title: '오사카 여행 기록',
              imageUrl: null,
              likeCount: 12,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
            },
          },
        ],
        1,
      ]),
    };

    const service = new UserMyPageContentService(
      {} as any,
      {} as any,
      {} as any,
      blogLikeRepository as any,
      {} as any,
    );

    await expect(service.getLikedBlogs('user-id', 1, 10)).resolves.toEqual({
      items: [
        {
          id: 'blog-id',
          title: '오사카 여행 기록',
          imageUrl: null,
          likeCount: 12,
          isLiked: true,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('returns liked regions with aggregated like counts', async () => {
    const regionLikeRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            regionId: 'region-id',
            region: {
              id: 'region-id',
              name: '도쿄',
              imageUrl: null,
              regionDescription: '야경 명소',
            },
          },
        ],
        1,
      ]),
      countByRegionIds: jest.fn().mockResolvedValue({ 'region-id': 7 }),
    };

    const service = new UserMyPageContentService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      regionLikeRepository as any,
    );

    await expect(service.getLikedRegions('user-id')).resolves.toEqual({
      items: [
        {
          regionId: 'region-id',
          regionName: '도쿄',
          imageUrl: null,
          description: '야경 명소',
          likeCount: 7,
          isLiked: true,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
