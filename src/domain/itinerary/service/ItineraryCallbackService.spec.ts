import { DataSource } from 'typeorm';
import { ItineraryCallbackService } from './ItineraryCallbackService';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseCountry } from '../../course/entity/CourseCountry.entity';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../entity/ItineraryStatus.enum';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';

describe('ItineraryCallbackService', () => {
  it('creates unique course-country mappings from survey destinations', async () => {
    const country = {
      id: 'country-jp',
      name: '일본',
      code: 'JP',
    };
    const survey = {
      id: 'survey-id',
      travelCourseId: null,
      destinations: [
        {
          region: {
            id: 'region-tokyo',
            name: '도쿄',
            country,
          },
          regionName: '도쿄',
          startDay: new Date('2026-03-11'),
          endDate: new Date('2026-03-12'),
        },
        {
          region: {
            id: 'region-osaka',
            name: '오사카',
            country,
          },
          regionName: '오사카',
          startDay: new Date('2026-03-13'),
          endDate: new Date('2026-03-14'),
        },
      ],
    } as unknown as CourseSurvey;

    const manager = {
      save: jest.fn(async (entity: unknown, value?: unknown) => {
        if (entity === TravelCourse) {
          return { ...(value as object), id: 'course-id' };
        }
        return value ?? entity;
      }),
      findOne: jest.fn(),
    };

    const dataSource = {
      transaction: jest.fn(async (callback: (manager: any) => Promise<void>) =>
        callback(manager),
      ),
    } as unknown as DataSource;

    const itineraryJobRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'job-id',
        userId: 'user-id',
        surveyId: 'survey-id',
        status: ItineraryStatus.PENDING,
        markSuccess: jest.fn(),
      } as unknown as ItineraryJob),
      save: jest.fn(),
    };

    const surveyRepository = {
      findOne: jest.fn().mockResolvedValue(survey),
    };

    const service = new ItineraryCallbackService(
      itineraryJobRepository as any,
      dataSource,
      {} as any,
      surveyRepository as any,
      {} as any,
    );

    await service.handleSuccess('job-id', {
      start_date: '2026-03-11',
      end_date: '2026-03-14',
      trip_days: 4,
      nights: 3,
      people_count: 2,
      tags: [],
      title: '일본 여행',
      summary: '도쿄와 오사카를 가는 일정',
      itinerary: [],
      llm_commentary: '좋은 일정입니다.',
      next_action_suggestion: ['체크리스트를 준비하세요.'],
    });

    expect(surveyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'survey-id' },
      relations: [
        'destinations',
        'destinations.region',
        'destinations.region.country',
      ],
    });
    expect(manager.save).toHaveBeenCalledWith(
      CourseCountry,
      expect.arrayContaining([
        expect.objectContaining({
          travelCourse: expect.objectContaining({ id: 'course-id' }),
          country,
        }),
      ]),
    );

    const courseCountrySaveCall = manager.save.mock.calls.find(
      ([entity]) => entity === CourseCountry,
    );
    expect(courseCountrySaveCall?.[1]).toHaveLength(1);
  });
});
