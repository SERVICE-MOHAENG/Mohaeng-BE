import { BlogLikeRepository } from './BlogLikeRepository';

describe('BlogLikeRepository', () => {
  const createQueryBuilder = () => ({
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  });

  it('includes owned private blogs in liked blog results', async () => {
    const queryBuilder = createQueryBuilder();
    queryBuilder.getManyAndCount.mockResolvedValue([
      [{ id: 'like-private' }, { id: 'like-public' }],
      2,
    ]);

    const hydratedPrivateLike = {
      id: 'like-private',
      travelBlog: {
        id: 'private-blog-id',
        isPublic: false,
        user: { id: 'user-id' },
      },
    };
    const hydratedPublicLike = {
      id: 'like-public',
      travelBlog: {
        id: 'public-blog-id',
        isPublic: true,
        user: { id: 'other-user-id' },
      },
    };

    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      find: jest
        .fn()
        .mockResolvedValue([hydratedPublicLike, hydratedPrivateLike]),
    };

    const blogLikeRepository = new BlogLikeRepository(repository as any);

    const [likes, total] = await blogLikeRepository.findByUserId(
      'user-id',
      1,
      10,
    );

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('blogLike');
    expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :userId', {
      userId: 'user-id',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(travelBlog.isPublic = :isPublic OR owner.id = :userId)',
      {
        userId: 'user-id',
        isPublic: true,
      },
    );
    expect(repository.find).toHaveBeenCalledWith({
      where: { id: expect.anything() },
      relations: [
        'travelBlog',
        'travelBlog.user',
        'travelBlog.travelCourse',
        'travelBlog.images',
        'travelBlog.hashTags',
      ],
      relationLoadStrategy: 'query',
    });
    expect(likes).toEqual([hydratedPrivateLike, hydratedPublicLike]);
    expect(total).toBe(2);
  });

  it('does not hydrate relations when the page is empty', async () => {
    const queryBuilder = createQueryBuilder();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      find: jest.fn(),
    };

    const blogLikeRepository = new BlogLikeRepository(repository as any);

    await expect(
      blogLikeRepository.findByUserId('user-id', 1, 10),
    ).resolves.toEqual([[], 0]);
    expect(repository.find).not.toHaveBeenCalled();
  });
});
