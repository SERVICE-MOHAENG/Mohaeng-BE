import { ItineraryModificationProcessor } from './ItineraryModificationProcessor';
import { PacePreference } from '../../course/entity/PacePreference.enum';
import { PlanningPreference } from '../../course/entity/PlanningPreference.enum';
import { DestinationPreference } from '../../course/entity/DestinationPreference.enum';
import { ActivityPreference } from '../../course/entity/ActivityPreference.enum';
import { PriorityPreference } from '../../course/entity/PriorityPreference.enum';
import { TravelTheme } from '../../course/entity/TravelTheme.enum';
import { Companion } from '../../course/entity/Companion.enum';

describe('ItineraryModificationProcessor', () => {
  it('loads roadmap survey preferences without budget_range', async () => {
    const processor = new ItineraryModificationProcessor(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
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
      } as any,
      {
        findOne: jest.fn(),
      } as any,
    );

    const loadSurveyPreferences = Reflect.get(
      processor,
      'loadSurveyPreferences',
    ) as (travelCourseId: string) => Promise<unknown>;

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
    const courseSurveyRepository = {
      findOne: jest.fn().mockResolvedValue({
        companions: [{ companion: Companion.FRIENDS }],
        themes: [{ theme: TravelTheme.SIGHTSEEING }],
        pacePreference: PacePreference.RELAXED,
        planningPreference: PlanningPreference.SPONTANEOUS,
        destinationPreference: DestinationPreference.LOCAL_EXPERIENCE,
        activityPreference: ActivityPreference.REST_FOCUSED,
        priorityPreference: PriorityPreference.EMOTIONAL,
      }),
    };
    const processor = new ItineraryModificationProcessor(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        findOne: jest.fn().mockResolvedValue(null),
      } as any,
      courseSurveyRepository as any,
    );

    const loadSurveyPreferences = Reflect.get(
      processor,
      'loadSurveyPreferences',
    ) as (travelCourseId: string) => Promise<unknown>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const preferences = await loadSurveyPreferences.call(
      processor,
      'course-id',
    );

    expect(courseSurveyRepository.findOne).toHaveBeenCalled();
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
});
