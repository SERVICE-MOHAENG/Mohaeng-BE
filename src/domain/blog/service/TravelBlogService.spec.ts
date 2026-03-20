import { TravelBlogService } from './TravelBlogService';
import { BlogSortType } from '../presentation/dto/request/GetBlogsRequest';

describe('TravelBlogService', () => {
  const createBlog = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 'blog-id',
      title: '교토 여행 기록',
      content: '사찰과 골목 중심 여행기',
      imageUrl: null,
      isPublic: true,
      viewCount: 0,
      likeCount: 3,
      createdAt: new Date('2026-03-19T00:00:00.000Z'),
      updatedAt: new Date('2026-03-19T00:00:00.000Z'),
      user: {
        id: 'user-id',
        name: '동건 하',
      },
      ...overrides,
    });

  const createService = (
    travelBlogRepositoryOverrides: Record<string, jest.Mock> = {},
    blogLikeRepositoryOverrides: Record<string, jest.Mock> = {},
  ) => {
    const travelBlogRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBlogsByLatest: jest.fn(),
      findBlogsByPopular: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      ...travelBlogRepositoryOverrides,
    };

    const blogLikeRepository = {
      existsByUserIdAndBlogId: jest.fn(),
      findLikedBlogIds: jest.fn().mockResolvedValue(new Set<string>()),
      ...blogLikeRepositoryOverrides,
    };

    const service = new TravelBlogService(
      travelBlogRepository as any,
      blogLikeRepository as any,
    );

    return {
      service,
      travelBlogRepository,
      blogLikeRepository,
    };
  };

  it('uses batch liked blog lookup for my blogs', async () => {
    const blog = createBlog();
    const { service, travelBlogRepository, blogLikeRepository } = createService(
      {
        findByUserId: jest.fn().mockResolvedValue([[blog], 1]),
      },
      {
        findLikedBlogIds: jest
          .fn()
          .mockResolvedValue(new Set<string>(['blog-id'])),
      },
    );

    const result = await service.getMyBlogs('user-id', 1, 6);

    expect(travelBlogRepository.findByUserId).toHaveBeenCalledWith(
      'user-id',
      1,
      6,
    );
    expect(blogLikeRepository.findLikedBlogIds).toHaveBeenCalledWith('user-id', [
      'blog-id',
    ]);
    expect(blogLikeRepository.existsByUserIdAndBlogId).not.toHaveBeenCalled();
    expect(result.blogs[0].isLiked).toBe(true);
  });

  it('uses batch liked blog lookup for authenticated public blog lists', async () => {
    const blog = createBlog();
    const { service, blogLikeRepository } = createService(
      {
        findBlogsByLatest: jest.fn().mockResolvedValue([[blog], 1]),
      },
      {
        findLikedBlogIds: jest
          .fn()
          .mockResolvedValue(new Set<string>(['blog-id'])),
      },
    );

    const result = await service.getBlogs(
      BlogSortType.LATEST,
      1,
      6,
      'user-id',
    );

    expect(blogLikeRepository.findLikedBlogIds).toHaveBeenCalledWith('user-id', [
      'blog-id',
    ]);
    expect(blogLikeRepository.existsByUserIdAndBlogId).not.toHaveBeenCalled();
    expect(result.blogs[0].isLiked).toBe(true);
  });
});
