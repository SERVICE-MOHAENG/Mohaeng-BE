import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ItineraryModificationProcessor } from './ItineraryModificationProcessor';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { RoadmapSurvey } from '../../course/entity/RoadmapSurvey.entity';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';
import { PacePreference } from '../../course/entity/PacePreference.enum';
import { PlanningPreference } from '../../course/entity/PlanningPreference.enum';
import { DestinationPreference } from '../../course/entity/DestinationPreference.enum';
import { ActivityPreference } from '../../course/entity/ActivityPreference.enum';
import { PriorityPreference } from '../../course/entity/PriorityPreference.enum';
import { TravelTheme } from '../../course/entity/TravelTheme.enum';
import { Companion } from '../../course/entity/Companion.enum';
import { PlaceCategory } from '../../place/entity/PlaceCategory.enum';

type SurveyPreferences = {
  companion_type: string[];
  travel_themes: string[];
  pace_preference: string;
  planning_preference: string;
  destination_preference: string;
  activity_preference: string;
  priority_preference: string;
};

describe('ItineraryModificationProcessor', () => {
  it('loads roadmap survey preferences without budget_range', async () => {
    const processor = new ItineraryModificationProcessor(
      new ConfigService<Record<string, unknown>>({}),
      new HttpService(),
      {} as ItineraryJobRepository,
      {} as Repository<TravelCourse>,
      {} as Repository<CourseAiChat>,
      {
        findOne: jest.fn().mockResolvedValue({
          companions: [{ companion: Companion.FAMILY }],
          themes: [{ theme: TravelTheme.UNIQUE_TRIP }],
          pacePreference: PacePreference.DENSE,
          planningPreference: PlanningPreference.PLANNED,
          destinationPreference: DestinationPreference.TOURIST_SPOTS,
          activityPreference: ActivityPreference.ACTIVE,
          priorityPreference: PriorityPreference.EFFICIENCY,
        }),
      } as unknown as Repository<RoadmapSurvey>,
      {
        findOne: jest.fn(),
      } as unknown as Repository<CourseSurvey>,
    );

    const loadSurveyPreferences = Reflect.get(
      processor,
      'loadSurveyPreferences',
    ) as (
      this: ItineraryModificationProcessor,
      travelCourseId: string,
    ) => Promise<SurveyPreferences | null>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const preferences = await loadSurveyPreferences.call(
      processor,
      'course-id',
    );

    expect(preferences).toEqual({
      companion_type: [Companion.FAMILY],
      travel_themes: [TravelTheme.UNIQUE_TRIP],
      pace_preference: PacePreference.DENSE,
      planning_preference: PlanningPreference.PLANNED,
      destination_preference: DestinationPreference.TOURIST_SPOTS,
      activity_preference: ActivityPreference.ACTIVE,
      priority_preference: PriorityPreference.EFFICIENCY,
    });
    expect(preferences).not.toHaveProperty('budget_range');
  });

  it('falls back to course survey preferences without budget_range', async () => {
    const courseSurveyFindOne = jest.fn().mockResolvedValue({
      companions: [{ companion: Companion.FRIENDS }],
      themes: [{ theme: TravelTheme.SIGHTSEEING }],
      pacePreference: PacePreference.RELAXED,
      planningPreference: PlanningPreference.SPONTANEOUS,
      destinationPreference: DestinationPreference.LOCAL_EXPERIENCE,
      activityPreference: ActivityPreference.REST_FOCUSED,
      priorityPreference: PriorityPreference.EMOTIONAL,
    });

    const processor = new ItineraryModificationProcessor(
      new ConfigService<Record<string, unknown>>({}),
      new HttpService(),
      {} as ItineraryJobRepository,
      {} as Repository<TravelCourse>,
      {} as Repository<CourseAiChat>,
      {
        findOne: jest.fn().mockResolvedValue(null),
      } as unknown as Repository<RoadmapSurvey>,
      {
        findOne: courseSurveyFindOne,
      } as unknown as Repository<CourseSurvey>,
    );

    const loadSurveyPreferences = Reflect.get(
      processor,
      'loadSurveyPreferences',
    ) as (
      this: ItineraryModificationProcessor,
      travelCourseId: string,
    ) => Promise<SurveyPreferences | null>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const preferences = await loadSurveyPreferences.call(
      processor,
      'course-id',
    );

    expect(courseSurveyFindOne).toHaveBeenCalled();
    expect(preferences).toEqual({
      companion_type: [Companion.FRIENDS],
      travel_themes: [TravelTheme.SIGHTSEEING],
      pace_preference: PacePreference.RELAXED,
      planning_preference: PlanningPreference.SPONTANEOUS,
      destination_preference: DestinationPreference.LOCAL_EXPERIENCE,
      activity_preference: ActivityPreference.REST_FOCUSED,
      priority_preference: PriorityPreference.EMOTIONAL,
    });
    expect(preferences).not.toHaveProperty('budget_range');
  });

  it('builds current itinerary json with place_category for Python chat requests', () => {
    const processor = new ItineraryModificationProcessor(
      new ConfigService<Record<string, unknown>>({}),
      new HttpService(),
      {} as ItineraryJobRepository,
      {} as Repository<TravelCourse>,
      {} as Repository<CourseAiChat>,
      {} as unknown as Repository<RoadmapSurvey>,
      {} as unknown as Repository<CourseSurvey>,
    );

    const buildCurrentItineraryJson = (
      processor as unknown as {
        buildCurrentItineraryJson: (course: TravelCourse) => {
          itinerary: Array<{
            places: Array<{
              place_category: PlaceCategory;
            }>;
          }>;
        };
      }
    ).buildCurrentItineraryJson.bind(processor);

    const result = buildCurrentItineraryJson({
      travelStartDay: new Date('2026-03-01'),
      travelFinishDay: new Date('2026-03-01'),
      days: 1,
      nights: 0,
      peopleCount: 2,
      hashTags: [],
      title: '서울 당일치기',
      description: '요약',
      courseDays: [
        {
          dayNumber: 1,
          date: new Date('2026-03-01'),
          coursePlaces: [
            {
              visitOrder: 1,
              visitTime: '09:00',
              description: '설명',
              place: {
                name: '국립현대미술관 서울관',
                placeId: 'place-id-1',
                address: '서울 종로구 삼청로 30',
                latitude: 37.5787,
                longitude: 126.9809,
                placeUrl: 'https://maps.google.com/?q=mmca',
                placeCategory: PlaceCategory.CULTURE,
              },
            },
          ],
        },
      ],
    } as unknown as TravelCourse);

    expect(result.itinerary[0].places[0].place_category).toBe(
      PlaceCategory.CULTURE,
    );
  });
});
