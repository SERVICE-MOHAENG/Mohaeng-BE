import { DataSource } from 'typeorm';
import { ItineraryModificationCallbackService } from './ItineraryModificationCallbackService';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseDay } from '../../course/entity/CourseDay.entity';
import { Place } from '../../place/entity/Place.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { ItineraryJob, IntentStatus } from '../entity/ItineraryJob.entity';

describe('ItineraryModificationCallbackService', () => {
  it('updates TravelCourse metadata without saving relation-loaded course entity', async () => {
    const course = {
      id: 'course-id',
      courseDays: [{ id: 'old-day' }],
      courseRegions: [],
    } as unknown as TravelCourse;

    const existingPlace = {
      placeId: 'place-id-1',
      name: '기존 장소',
      address: '주소',
      latitude: 37.5,
      longitude: 127.0,
      description: null,
      placeUrl: 'https://maps.google.com/?q=place',
      updatedAt: new Date(),
    } as Place;

    const manager = {
      findOne: jest.fn(async (entity: unknown, options?: any) => {
        if (entity === TravelCourse) {
          return course;
        }
        if (entity === Place) {
          return options?.where?.placeId === 'place-id-1' ? existingPlace : null;
        }
        return null;
      }),
      delete: jest.fn(async () => ({ affected: 1 })),
      save: jest.fn(async (entity: unknown, value?: unknown) => {
        if (entity === CourseDay && value) {
          return { ...(value as object), id: 'new-day-id' };
        }
        return value ?? entity;
      }),
      update: jest.fn(async () => ({ affected: 1 })),
    };

    const dataSource = {
      transaction: jest.fn(async (callback: (manager: any) => Promise<void>) =>
        callback(manager),
      ),
    } as unknown as DataSource;

    const service = new ItineraryModificationCallbackService(
      {} as any,
      dataSource,
      {} as any,
      {} as any,
      {} as any,
    );

    const job = {
      id: 'job-id',
      travelCourseId: 'course-id',
      markSuccessWithIntent: jest.fn(),
    } as unknown as ItineraryJob;

    await (service as any).updateTravelCourse(
      job,
      '일정 바꿔줘',
      {
        start_date: '2026-03-12',
        end_date: '2026-03-13',
        trip_days: 2,
        nights: 1,
        people_count: 2,
        tags: [],
        title: '수정된 일정',
        summary: '수정된 요약',
        itinerary: [
          {
            day_number: 1,
            daily_date: '2026-03-12',
            places: [
              {
                place_name: '기존 장소',
                place_id: 'place-id-1',
                address: '주소',
                latitude: 37.5,
                longitude: 127.0,
                place_url: 'https://maps.google.com/?q=place',
                description: '설명',
                visit_sequence: 1,
                visit_time: '09:00',
              },
            ],
          },
        ],
      },
      '변경 완료',
      ['day1_place1'],
    );

    expect(manager.update).toHaveBeenCalledWith(
      TravelCourse,
      'course-id',
      expect.objectContaining({
        title: '수정된 일정',
        description: '수정된 요약',
        nights: 1,
        days: 2,
        peopleCount: 2,
      }),
    );
    expect(manager.save).not.toHaveBeenCalledWith(TravelCourse, course);
    expect((job.markSuccessWithIntent as jest.Mock)).toHaveBeenCalledWith(
      IntentStatus.SUCCESS,
      '변경 완료',
      ['day1_place1'],
    );
    expect(manager.save).toHaveBeenCalledWith(CourseAiChat, expect.any(Object));
  });
});
