import { TravelBlogService } from './TravelBlogService';
import { BlogSortType } from '../presentation/dto/request/GetBlogsRequest';
import { CourseAccessDeniedException } from '../../course/exception/CourseAccessDeniedException';
import { BlogAlreadyExistsForRoadmapException } from '../exception/BlogAlreadyExistsForRoadmapException';
import { BlogRoadmapNotCompletedException } from '../exception/BlogRoadmapNotCompletedException';

describe('TravelBlogService', () => {
  const createBlog = (overrides: Record<string, unknown> = {}) => ({
    id: 'blog-id',
    travelCourse: {
      id: 'course-id',
    },
    title: '교토 여행 기록',
    content: '사찰과 골목 중심 여행기',
    imageUrl: null,
    images: [],
    hashTags: [],
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

  const createCourse = (overrides: Record<string, unknown> = {}) => ({
    id: 'course-id',
    isCompleted: true,
    user: {
      id: 'user-id',
      name: '동건 하',
    },
    ...overrides,
  });

  const createService = (
    travelBlogRepositoryOverrides: Record<string, jest.Mock> = {},
    blogLikeRepositoryOverrides: Record<string, jest.Mock> = {},
    travelCourseServiceOverrides: Record<string, jest.Mock> = {},
  ) => {
    const travelBlogRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBlogsByLatest: jest.fn(),
      findBlogsByPopular: jest.fn(),
      existsByTravelCourseId: jest.fn().mockResolvedValue(false),
      save: jest.fn(),
      delete: jest.fn(),
      ...travelBlogRepositoryOverrides,
    };

    const blogLikeRepository = {
      existsByUserIdAndBlogId: jest.fn(),
      findLikedBlogIds: jest.fn().mockResolvedValue(new Set<string>()),
      ...blogLikeRepositoryOverrides,
    };

    const travelCourseService = {
      findById: jest.fn(),
      ...travelCourseServiceOverrides,
    };

    const service = new TravelBlogService(
      travelBlogRepository as any,
      blogLikeRepository as any,
      travelCourseService as any,
    );

    return {
      service,
      travelBlogRepository,
      blogLikeRepository,
      travelCourseService,
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
    expect(blogLikeRepository.findLikedBlogIds).toHaveBeenCalledWith(
      'user-id',
      ['blog-id'],
    );
    expect(blogLikeRepository.existsByUserIdAndBlogId).not.toHaveBeenCalled();
    expect(result.blogs[0].isLiked).toBe(true);
  });

  it('creates a blog for a completed owned roadmap', async () => {
    const course = createCourse();
    const savedBlog = createBlog({
      imageUrl: 'https://example.com/1.jpg',
      images: [
        { imageUrl: 'https://example.com/1.jpg', sortOrder: 0 },
        { imageUrl: 'https://example.com/2.jpg', sortOrder: 1 },
      ],
      hashTags: [{ tagName: '#미식' }, { tagName: '#뉴욕' }],
    });
    const { service, travelBlogRepository, travelCourseService } =
      createService(
        {
          save: jest.fn().mockResolvedValue(savedBlog),
          findById: jest.fn().mockResolvedValue(savedBlog),
        },
        {},
        {
          findById: jest.fn().mockResolvedValue(course),
        },
      );

    const result = await service.createBlog('user-id', {
      travelCourseId: 'course-id',
      title: '뉴욕 미식 여행',
      content: '좋았던 식당 정리',
      imageUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      tags: ['미식', '#뉴욕', '미식'],
      isPublic: true,
    });

    expect(travelCourseService.findById).toHaveBeenCalledWith('course-id');
    expect(travelBlogRepository.existsByTravelCourseId).toHaveBeenCalledWith(
      'course-id',
    );
    expect(travelBlogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '뉴욕 미식 여행',
        content: '좋았던 식당 정리',
        imageUrl: 'https://example.com/1.jpg',
        travelCourse: course,
        images: [
          expect.objectContaining({
            imageUrl: 'https://example.com/1.jpg',
            sortOrder: 0,
          }),
          expect.objectContaining({
            imageUrl: 'https://example.com/2.jpg',
            sortOrder: 1,
          }),
        ],
        hashTags: [
          expect.objectContaining({ tagName: '#미식' }),
          expect.objectContaining({ tagName: '#뉴욕' }),
        ],
      }),
    );
    expect(result).toBe(savedBlog);
  });

  it('creates public blog by default when visibility is omitted', async () => {
    const course = createCourse();
    const savedBlog = createBlog({ isPublic: true });
    const { service, travelBlogRepository, travelCourseService } =
      createService(
        {
          save: jest.fn().mockResolvedValue(savedBlog),
          findById: jest.fn().mockResolvedValue(savedBlog),
        },
        {},
        {
          findById: jest.fn().mockResolvedValue(course),
        },
      );

    await service.createBlog('user-id', {
      travelCourseId: 'course-id',
      title: '블로그',
      content: '본문',
    });

    expect(travelCourseService.findById).toHaveBeenCalledWith('course-id');
    expect(travelBlogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublic: true,
      }),
    );
  });

  it('rejects blog creation when roadmap is owned by another user', async () => {
    const { service } = createService(
      {},
      {},
      {
        findById: jest.fn().mockResolvedValue(
          createCourse({
            user: {
              id: 'other-user-id',
              name: '다른 사용자',
            },
          }),
        ),
      },
    );

    await expect(
      service.createBlog('user-id', {
        travelCourseId: 'course-id',
        title: '블로그',
        content: '본문',
      }),
    ).rejects.toBeInstanceOf(CourseAccessDeniedException);
  });

  it('rejects blog creation when roadmap is not completed', async () => {
    const { service } = createService(
      {},
      {},
      {
        findById: jest.fn().mockResolvedValue(
          createCourse({
            isCompleted: false,
          }),
        ),
      },
    );

    await expect(
      service.createBlog('user-id', {
        travelCourseId: 'course-id',
        title: '블로그',
        content: '본문',
      }),
    ).rejects.toBeInstanceOf(BlogRoadmapNotCompletedException);
  });

  it('rejects blog creation when roadmap already has a blog', async () => {
    const { service } = createService(
      {
        existsByTravelCourseId: jest.fn().mockResolvedValue(true),
      },
      {},
      {
        findById: jest.fn().mockResolvedValue(createCourse()),
      },
    );

    await expect(
      service.createBlog('user-id', {
        travelCourseId: 'course-id',
        title: '블로그',
        content: '본문',
      }),
    ).rejects.toBeInstanceOf(BlogAlreadyExistsForRoadmapException);
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

    const result = await service.getBlogs(BlogSortType.LATEST, 1, 6, 'user-id');

    expect(blogLikeRepository.findLikedBlogIds).toHaveBeenCalledWith(
      'user-id',
      ['blog-id'],
    );
    expect(blogLikeRepository.existsByUserIdAndBlogId).not.toHaveBeenCalled();
    expect(result.blogs[0].isLiked).toBe(true);
  });
});
