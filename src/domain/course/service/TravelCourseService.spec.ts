import { TravelCourse } from '../entity/TravelCourse.entity';
import { TravelCourseService } from './TravelCourseService';
import { CourseAccessDeniedException } from '../exception/CourseAccessDeniedException';
import { CourseNotFoundException } from '../exception/CourseNotFoundException';

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
  ) => {
    const manager = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const travelCourseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      countDistinctCompletedCountriesByUserId: jest.fn(),
      ...travelCourseRepositoryOverrides,
    };

    const dataSource = {
      transaction: jest.fn().mockImplementation(async (callback) =>
        callback(manager),
      ),
    };

    const service = new TravelCourseService(
      travelCourseRepository as any,
      {} as any,
      {} as any,
      dataSource as any,
    );

    return { service, travelCourseRepository, manager, dataSource };
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
  });

  it('updates completion status to true for the course owner', async () => {
    const course = createCourseEntity();
    const { service, travelCourseRepository, manager } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: true,
      }),
      countDistinctCompletedCountriesByUserId: jest.fn().mockResolvedValue(2),
    });
    manager.findOne.mockResolvedValue(course);

    const result = await service.updateCompletionStatus(
      'course-id',
      'user-id',
      true,
    );

    expect(manager.save).toHaveBeenCalledWith(
      TravelCourse,
      expect.objectContaining({ id: 'course-id', isCompleted: true }),
    );
    expect(travelCourseRepository.countDistinctCompletedCountriesByUserId).toHaveBeenCalledWith(
      'user-id',
      manager,
    );
    expect(manager.update).toHaveBeenCalledWith(
      expect.anything(),
      'user-id',
      { visitedCountries: 2 },
    );
    expect(result.isCompleted).toBe(true);
  });

  it('updates completion status to false and syncs unique country count', async () => {
    const course = createCourseEntity({ isCompleted: true });
    const { service, travelCourseRepository, manager } = createService({
      findById: jest.fn().mockResolvedValue({
        ...course,
        isCompleted: false,
      }),
      countDistinctCompletedCountriesByUserId: jest.fn().mockResolvedValue(1),
    });
    manager.findOne.mockResolvedValue(course);

    const result = await service.updateCompletionStatus(
      'course-id',
      'user-id',
      false,
    );

    expect(travelCourseRepository.countDistinctCompletedCountriesByUserId).toHaveBeenCalledWith(
      'user-id',
      manager,
    );
    expect(manager.update).toHaveBeenCalledWith(
      expect.anything(),
      'user-id',
      { visitedCountries: 1 },
    );
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
    const { service, travelCourseRepository, manager } = createService({
      countDistinctCompletedCountriesByUserId: jest.fn().mockResolvedValue(1),
    });
    manager.findOne.mockResolvedValue(course);

    await service.deleteCourse('course-id', 'user-id');

    expect(manager.delete).toHaveBeenCalledWith(TravelCourse, 'course-id');
    expect(travelCourseRepository.countDistinctCompletedCountriesByUserId).toHaveBeenCalledWith(
      'user-id',
      manager,
    );
    expect(manager.update).toHaveBeenCalledWith(
      expect.anything(),
      'user-id',
      { visitedCountries: 1 },
    );
  });

  it('does not recalculate visited country count when deleting an incomplete course', async () => {
    const course = createCourseEntity({ isCompleted: false });
    const { service, travelCourseRepository, manager } = createService();
    manager.findOne.mockResolvedValue(course);

    await service.deleteCourse('course-id', 'user-id');

    expect(manager.delete).toHaveBeenCalledWith(TravelCourse, 'course-id');
    expect(
      travelCourseRepository.countDistinctCompletedCountriesByUserId,
    ).not.toHaveBeenCalled();
    expect(manager.update).not.toHaveBeenCalled();
  });
});
