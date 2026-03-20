import { UserMyPageContentService } from './UserMyPageContentService';

describe('UserMyPageContentService', () => {
  it('returns my roadmaps with normalized pagination and liked state', async () => {
    const travelCourseRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            id: 'course-id',
            title: '시부야 밤거리',
            description: '도쿄 야경 중심 일정',
            imageUrl: null,
            days: 1,
            nights: 0,
            likeCount: 7,
            peopleCount: 2,
            travelStartDay: new Date('2026-03-20'),
            travelFinishDay: new Date('2026-03-20'),
            hashTags: [{ tagName: '#당일치기' }, { tagName: '#친구' }],
            courseDays: [],
          },
        ],
        1,
      ]),
    };
    const courseLikeRepository = {
      findLikedCourseIds: jest
        .fn()
        .mockResolvedValue(new Set<string>(['course-id'])),
    };
    const service = new UserMyPageContentService(
      travelCourseRepository as any,
      {} as any,
      courseLikeRepository as any,
      {} as any,
      {} as any,
    );

    await expect(service.getMyRoadmaps('user-id', 0, 99)).resolves.toEqual({
      courses: [
        {
          id: 'course-id',
          title: '시부야 밤거리',
          start_date: '2026-03-20',
          end_date: '2026-03-20',
          tags: ['당일치기', '친구'],
          like_count: 7,
          is_liked: true,
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
    expect(courseLikeRepository.findLikedCourseIds).toHaveBeenCalledWith(
      'user-id',
      ['course-id'],
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
          content: undefined,
          imageUrl: null,
          isPublic: undefined,
          viewCount: undefined,
          likeCount: 12,
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
          updatedAt: undefined,
          userId: undefined,
          userName: undefined,
          isLiked: true,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('returns my blogs with batch liked lookup', async () => {
    const travelBlogRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            id: 'blog-id',
            title: '오키나와 여행 기록',
            content: '바다 중심 여행기',
            imageUrl: null,
            isPublic: true,
            viewCount: 12,
            likeCount: 4,
            createdAt: new Date('2026-03-12T00:00:00.000Z'),
            updatedAt: new Date('2026-03-12T00:00:00.000Z'),
          },
        ],
        1,
      ]),
    };
    const blogLikeRepository = {
      findByUserId: jest.fn(),
      existsByUserIdAndBlogId: jest.fn(),
      findLikedBlogIds: jest
        .fn()
        .mockResolvedValue(new Set<string>(['blog-id'])),
    };

    const service = new UserMyPageContentService(
      {} as any,
      travelBlogRepository as any,
      {} as any,
      blogLikeRepository as any,
      {} as any,
    );

    const result = await service.getMyBlogs('user-id', 1, 10);

    expect(travelBlogRepository.findByUserId).toHaveBeenCalledWith(
      'user-id',
      1,
      10,
    );
    expect(blogLikeRepository.findLikedBlogIds).toHaveBeenCalledWith('user-id', [
      'blog-id',
    ]);
    expect(blogLikeRepository.existsByUserIdAndBlogId).not.toHaveBeenCalled();
    expect(result.blogs[0].isLiked).toBe(true);
  });

  it('returns liked roadmaps with isLiked set to true', async () => {
    const courseLikeRepository = {
      findByUserId: jest.fn().mockResolvedValue([
        [
          {
            travelCourse: {
              id: 'course-id',
              title: '뉴욕 예술 탐험',
              description: '설명',
              imageUrl: null,
              viewCount: 0,
              nights: 2,
              days: 3,
              likeCount: 10,
              modificationCount: 1,
              travelStartDay: new Date('2026-03-12'),
              travelFinishDay: new Date('2026-03-14'),
              user: { id: 'user-id', name: '동건 하' },
              courseCountries: [],
              courseRegions: [],
              hashTags: [{ tagName: '#예술' }, { tagName: '#도시' }],
              courseDays: [],
              isPublic: true,
              isCompleted: false,
              sourceCourseId: null,
              createdAt: new Date('2026-03-12T00:00:00.000Z'),
              updatedAt: new Date('2026-03-12T00:00:00.000Z'),
            },
          },
        ],
        1,
      ]),
    };

    const service = new UserMyPageContentService(
      {} as any,
      {} as any,
      courseLikeRepository as any,
      {} as any,
      {} as any,
    );

    await expect(service.getLikedRoadmaps('user-id', 1, 10)).resolves.toEqual({
      courses: [
        {
          id: 'course-id',
          title: '뉴욕 예술 탐험',
          start_date: '2026-03-12',
          end_date: '2026-03-14',
          tags: ['예술', '도시'],
          like_count: 10,
          is_liked: true,
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
