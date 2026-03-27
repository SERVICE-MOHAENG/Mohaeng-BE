import { TravelCourse } from '../entity/TravelCourse.entity';
import { TravelCourseService } from './TravelCourseService';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';
import { CourseCountry } from '../entity/CourseCountry.entity';
import { UserVisitedCountry } from '../../visited-country/entity/UserVisitedCountry.entity';

describe('TravelCourseService', () => {
  const createCourseEntity = (
    overrides: Partial<TravelCourse> = {},
  ): TravelCourse =>
    ({
      id: 'course-id',
      title: '테스트 코스',
      description: '설명',
      imageUrl: null,
      viewCount: 0,
      nights: 1,
      days: 2,
      likeCount: 0,
      modificationCount: 0,
      peopleCount: 1,
      isPublic: false,
      isCompleted: false,
      sourceCourseId: null,
      createdAt: new Date('2026-03-11T00:00:00.000Z'),
      updatedAt: new Date('2026-03-11T00:00:00.000Z'),
      travelStartDay: new Date('2026-03-11'),
      travelFinishDay: new Date('2026-03-12'),
      user: { id: 'user-id', name: '홍길동' },
      courseCountries: [],
      courseRegions: [],
      courseDays: [],
      hashTags: [],
      ...overrides,
    }) as TravelCourse;

  const createService = (
    travelCourseRepositoryOverrides: Record<string, jest.Mock> = {},
    itineraryJobRepositoryOverrides: Record<string, jest.Mock> = {},
    userRepositoryOverrides: Record<string, jest.Mock> = {},
    courseLikeRepositoryOverrides: Record<string, jest.Mock> = {},
  ) => {
    const deleteQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    const manager = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn((_: unknown, plain: unknown) => plain),
      createQueryBuilder: jest.fn(() => deleteQueryBuilder),
    };

    const travelCourseRepository = {
      findById: jest.fn(),
      findByIdWithAllRelations: jest.fn(),
      findCoursesForMainPage: jest.fn(),
      findPublicCoursesByRegion: jest.fn(),
      save: jest.fn(),
      ...travelCourseRepositoryOverrides,
    };

    const userRepository = {
      findById: jest.fn(),
      ...userRepositoryOverrides,
    };

    const courseLikeRepository = {
      existsByUserIdAndCourseId: jest.fn(),
      findLikedCourseIds: jest.fn().mockResolvedValue(new Set<string>()),
      ...courseLikeRepositoryOverrides,
    };

    const itineraryJobRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      ...itineraryJobRepositoryOverrides,
    };

    const dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (callback) => callback(manager)),
    };

    const service = new TravelCourseService(
      travelCourseRepository as any,
      userRepository as any,
      courseLikeRepository as any,
      itineraryJobRepository as any,
      dataSource as any,
    );

    return {
      service,
      travelCourseRepository,
      userRepository,
      courseLikeRepository,
      itineraryJobRepository,
      manager,
      deleteQueryBuilder,
      dataSource,
    };
  };

  it('defaults isCompleted to false when creating a course entity', () => {
    const course = TravelCourse.create(
      '도쿄 여행',
      { id: 'user-id' } as any,
      2,
      3,
      '설명',
    );

    expect(course.isCompleted).toBe(false);
    expect(course.createdAt).toBeInstanceOf(Date);
    expect(course.updatedAt).toBeInstanceOf(Date);
  });

  it('updates completion status to true for the course owner', async () => {
    const country = {
      id: 'country-jp',
      name: '일본',
      code: 'JP',
    } as any;
    const course = createCourseEntity();
    const completedCourse = createCourseEntity({
      isCompleted: true,
      courseCountries: [{ country }] as any,
      travelFinishDay: new Date('2026-03-12'),
    });
    const { service, manager, deleteQueryBuilder } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: true,
      }),
    });
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([completedCourse]);

    const result = await service.updateCompletionStatus(
      'course-id',
      'user-id',
      true,
    );

    expect(manager.save).toHaveBeenCalledWith(
      TravelCourse,
      expect.objectContaining({ id: 'course-id', isCompleted: true }),
    );
    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 1,
    });
    expect(deleteQueryBuilder.execute).toHaveBeenCalled();
    expect(manager.save).toHaveBeenCalledWith(
      UserVisitedCountry,
      expect.arrayContaining([
        expect.objectContaining({
          country,
          user: { id: 'user-id' },
          visitDate: new Date('2026-03-12'),
        }),
      ]),
    );
    expect(result.isCompleted).toBe(true);
  });

  it('updates completion status to false and syncs unique country count', async () => {
    const course = createCourseEntity({ isCompleted: true });
    const { service, manager } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: false,
      }),
    });
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([
      createCourseEntity({
        isCompleted: true,
        courseCountries: [
          {
            country: {
              id: 'country-fr',
              name: '프랑스',
              code: 'FR',
            },
          },
        ] as any,
        travelFinishDay: new Date('2026-04-03'),
      }),
    ]);

    const result = await service.updateCompletionStatus(
      'course-id',
      'user-id',
      false,
    );

    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 1,
    });
    expect(result.isCompleted).toBe(false);
  });

  it('throws when another user tries to update completion status', async () => {
    const course = createCourseEntity();
    const { service, manager } = createService();
    manager.findOne.mockResolvedValue(course);

    await expect(
      service.updateCompletionStatus('course-id', 'other-user-id', true),
    ).rejects.toBeInstanceOf(CourseAccessDeniedException);
  });

  it('throws when the course does not exist', async () => {
    const { service, manager } = createService();
    manager.findOne.mockResolvedValue(null);

    await expect(
      service.updateCompletionStatus('missing-course-id', 'user-id', true),
    ).rejects.toBeInstanceOf(CourseNotFoundException);
  });

  it('recalculates visited country count when deleting a completed course', async () => {
    const course = createCourseEntity({ isCompleted: true });
    const { service, manager } = createService();
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([
      createCourseEntity({
        isCompleted: true,
        courseCountries: [
          {
            country: {
              id: 'country-us',
              name: '미국',
              code: 'US',
            },
          },
        ] as any,
        travelFinishDay: new Date('2026-05-01'),
      }),
    ]);

    await service.deleteCourse('course-id', 'user-id');

    expect(manager.delete).toHaveBeenCalledWith(TravelCourse, 'course-id');
    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 1,
    });
  });

  it('keeps visited country count at zero when deleting an incomplete course', async () => {
    const course = createCourseEntity({ isCompleted: false });
    const { service, manager } = createService();
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([]);

    await service.deleteCourse('course-id', 'user-id');

    expect(manager.delete).toHaveBeenCalledWith(TravelCourse, 'course-id');
    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 0,
    });
  });

  it('deduplicates countries across completed courses when syncing visited countries', async () => {
    const country = {
      id: 'country-jp',
      name: '일본',
      code: 'JP',
    } as any;
    const course = createCourseEntity();
    const { service, manager } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: true,
      }),
    });
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([
      createCourseEntity({
        id: 'course-1',
        isCompleted: true,
        courseCountries: [{ country }] as any,
        travelFinishDay: new Date('2026-03-12'),
      }),
      createCourseEntity({
        id: 'course-2',
        isCompleted: true,
        courseCountries: [{ country }] as any,
        travelFinishDay: new Date('2026-04-20'),
      }),
    ]);

    await service.updateCompletionStatus('course-id', 'user-id', true);

    expect(manager.save).toHaveBeenCalledWith(
      UserVisitedCountry,
      expect.arrayContaining([
        expect.objectContaining({
          country,
          visitDate: new Date('2026-04-20'),
        }),
      ]),
    );
    const visitedCountrySaveCall = manager.save.mock.calls.find(
      ([entity]) => entity === UserVisitedCountry,
    );
    expect(visitedCountrySaveCall?.[1]).toHaveLength(1);
    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 1,
    });
  });

  it('falls back to course regions when completed courses are missing country mappings', async () => {
    const country = {
      id: 'country-jp',
      name: '일본',
      code: 'JP',
    } as any;
    const course = createCourseEntity();
    const { service, manager } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: true,
      }),
    });
    manager.findOne.mockResolvedValue(course);
    manager.find.mockResolvedValue([
      createCourseEntity({
        id: 'course-1',
        isCompleted: true,
        courseCountries: [],
        courseRegions: [
          {
            region: {
              country,
            },
          },
        ] as any,
        travelFinishDay: new Date('2026-06-15'),
      }),
    ]);

    await service.updateCompletionStatus('course-id', 'user-id', true);

    expect(manager.save).toHaveBeenCalledWith(
      CourseCountry,
      expect.arrayContaining([
        expect.objectContaining({
          travelCourse: expect.objectContaining({ id: 'course-1' }),
          country,
        }),
      ]),
    );
    expect(manager.save).toHaveBeenCalledWith(
      UserVisitedCountry,
      expect.arrayContaining([
        expect.objectContaining({
          country,
          visitDate: new Date('2026-06-15'),
        }),
      ]),
    );
    expect(manager.update).toHaveBeenCalledWith(expect.anything(), 'user-id', {
      visitedCountries: 1,
    });
  });

  it('returns AI-style roadmap items for my courses', async () => {
    const course = createCourseEntity({
      title: '뉴욕 예술 탐험',
      description: '뉴욕 예술 중심 일정',
      hashTags: [{ tagName: '#뉴욕' }, { tagName: '#예술' }] as any,
      courseDays: [
        {
          dayNumber: 1,
          date: new Date('2026-03-11'),
          coursePlaces: [
            {
              visitOrder: 1,
              visitTime: '09:00',
              description: '센트럴 파크에서 자연을 만끽하세요.',
              place: {
                name: '센트럴 파크',
                placeId: 'google-place-id',
                address: '뉴욕',
                latitude: 40.1,
                longitude: -73.1,
                placeUrl: 'https://example.com',
                description: '장소 설명',
              } as any,
            },
          ],
        },
      ] as any,
    });

    const { service } = createService(
      {
        findByUserId: jest.fn().mockResolvedValue([[course], 1]),
      },
      {
        find: jest.fn().mockResolvedValue([
          {
            travelCourseId: 'course-id',
            llmCommentary: '추천 이유',
            nextActionSuggestions: ['다음 행동'],
            completedAt: new Date('2026-03-11T12:00:00.000Z'),
            createdAt: new Date('2026-03-11T11:00:00.000Z'),
          },
        ]),
      },
    );

    const result = await service.getMyCourses('user-id', 1, 20);

    expect(result.page).toBe(1);
    expect(result.total).toBe(1);
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].data.title).toBe('뉴욕 예술 탐험');
    expect(result.courses[0].data.tags).toEqual(['뉴욕', '예술']);
    expect(result.courses[0].data.itinerary[0].places[0].visit_time).toBe(
      '09:00',
    );
    expect(result.courses[0].data.llm_commentary).toBe('추천 이유');
    expect(result.courses[0].data.next_action_suggestion).toEqual([
      '다음 행동',
    ]);
  });

  it('returns mainpage roadmap summaries', async () => {
    const course = createCourseEntity({
      title: '시부야 밤거리',
      description: '병현이와 함께하는 시부야 여행',
      imageUrl: 'https://example.com/course.jpg',
      days: 1,
      likeCount: 1002,
      hashTags: [{ tagName: '#당일치기' }, { tagName: '#친구' }] as any,
      isPublic: true,
    });

    const { service, travelCourseRepository } = createService({
      findCoursesForMainPage: jest.fn().mockResolvedValue([[course], 1]),
    });

    const result = await service.getCoursesForMainPage('latest', 'JP', 1, 10);

    expect(travelCourseRepository.findCoursesForMainPage).toHaveBeenCalledWith(
      'latest',
      'JP',
      1,
      10,
    );
    expect(result).toEqual({
      courses: [
        {
          id: 'course-id',
          title: '시부야 밤거리',
          description: '병현이와 함께하는 시부야 여행',
          start_date: '2026-03-11',
          end_date: '2026-03-12',
          tags: ['당일치기', '친구'],
          like_count: 1002,
          is_liked: false,
          is_completed: false,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('uses batch liked course lookup for authenticated mainpage requests', async () => {
    const course = createCourseEntity({
      title: '오사카 미식 투어',
      description: '먹거리 중심 일정',
      isPublic: true,
    });

    const { service, courseLikeRepository } = createService(
      {
        findCoursesForMainPage: jest.fn().mockResolvedValue([[course], 1]),
      },
      {},
      {},
      {
        findLikedCourseIds: jest
          .fn()
          .mockResolvedValue(new Set<string>(['course-id'])),
      },
    );

    const result = await service.getCoursesForMainPage(
      'latest',
      undefined,
      1,
      10,
      'user-id',
    );

    expect(courseLikeRepository.findLikedCourseIds).toHaveBeenCalledWith(
      'user-id',
      ['course-id'],
    );
    expect(courseLikeRepository.existsByUserIdAndCourseId).not.toHaveBeenCalled();
    expect(result.courses[0].is_liked).toBe(true);
  });

  it('uses batch liked course lookup for region course requests', async () => {
    const course = createCourseEntity({
      title: '후쿠오카 산책',
      description: '도심 산책 일정',
      isPublic: true,
    });

    const { service, travelCourseRepository, courseLikeRepository } =
      createService(
        {
          findPublicCoursesByRegion: jest.fn().mockResolvedValue([[course], 1]),
        } as any,
        {},
        {},
        {
          findLikedCourseIds: jest
            .fn()
            .mockResolvedValue(new Set<string>(['course-id'])),
        },
      );

    const result = await service.getPublicCoursesByRegion(
      'region-id',
      'latest',
      1,
      10,
      'user-id',
    );

    expect(travelCourseRepository.findPublicCoursesByRegion).toHaveBeenCalledWith(
      'region-id',
      'latest',
      1,
      10,
    );
    expect(courseLikeRepository.findLikedCourseIds).toHaveBeenCalledWith(
      'user-id',
      ['course-id'],
    );
    expect(courseLikeRepository.existsByUserIdAndCourseId).not.toHaveBeenCalled();
    expect(result.courses[0].isLiked).toBe(true);
  });

  it('returns only the copied roadmap id', async () => {
    const sourceCourse = createCourseEntity({
      isPublic: true,
      courseCountries: [],
      courseDays: [],
      courseRegions: [],
    });

    const { service, travelCourseRepository, userRepository, manager } =
      createService(
        {
          findByIdWithAllRelations: jest.fn().mockResolvedValue(sourceCourse),
        },
        {},
        {
          findById: jest
            .fn()
            .mockResolvedValue({ id: 'target-user-id', name: '복사한 유저' }),
        },
      );

    manager.save.mockImplementation(async (entity: unknown, value: any) => {
      if (entity === TravelCourse) {
        return { ...value, id: 'copied-course-id' };
      }
      return value;
    });

    await expect(
      service.copyRoadmap('source-course-id', 'target-user-id'),
    ).resolves.toEqual({
      id: 'copied-course-id',
    });

    expect(manager.save).toHaveBeenCalledWith(
      TravelCourse,
      expect.objectContaining({
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        sourceCourseId: 'course-id',
      }),
    );

    expect(
      travelCourseRepository.findByIdWithAllRelations,
    ).toHaveBeenCalledWith('source-course-id');
    expect(userRepository.findById).toHaveBeenCalledWith('target-user-id');
  });
});
