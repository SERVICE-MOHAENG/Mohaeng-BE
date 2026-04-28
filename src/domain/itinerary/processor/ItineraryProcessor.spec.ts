import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ItineraryProcessor } from './ItineraryProcessor';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';
import { PacePreference } from '../../course/entity/PacePreference.enum';
import { PlanningPreference } from '../../course/entity/PlanningPreference.enum';
import { DestinationPreference } from '../../course/entity/DestinationPreference.enum';
import { ActivityPreference } from '../../course/entity/ActivityPreference.enum';
import { PriorityPreference } from '../../course/entity/PriorityPreference.enum';
import { TravelTheme } from '../../course/entity/TravelTheme.enum';
import { Companion } from '../../course/entity/Companion.enum';

type GeneratePayload = {
  start_date: string;
  end_date: string;
  regions: Array<{ region: string; start_date: string; end_date: string }>;
  people_count: number;
  companion_type: string[];
  travel_themes: string[];
  pace_preference: string;
  planning_preference: string;
  destination_preference: string;
  activity_preference: string;
  priority_preference: string;
  notes: string;
};

describe('ItineraryProcessor', () => {
  it('builds /api/v1/generate payload without budget_range', () => {
    const processor = new ItineraryProcessor(
      new ConfigService<Record<string, unknown>>({}),
      new HttpService(),
      {} as ItineraryJobRepository,
      {} as Repository<CourseSurvey>,
    );

    const buildPythonPayload = Reflect.get(processor, 'buildPythonPayload') as (
      this: ItineraryProcessor,
      survey: unknown,
    ) => GeneratePayload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = buildPythonPayload.call(processor, {
      travelStartDay: new Date('2026-04-10'),
      travelEndDay: new Date('2026-04-12'),
      destinations: [
        {
          regionName: 'SEOUL',
          startDay: new Date('2026-04-10'),
          endDate: new Date('2026-04-12'),
          region: { regionCode: 'KR-11' },
        },
      ],
      paxCount: 2,
      companions: [{ companion: Companion.FAMILY }],
      themes: [{ theme: TravelTheme.UNIQUE_TRIP }],
      pacePreference: PacePreference.DENSE,
      planningPreference: PlanningPreference.PLANNED,
      destinationPreference: DestinationPreference.TOURIST_SPOTS,
      activityPreference: ActivityPreference.ACTIVE,
      priorityPreference: PriorityPreference.EFFICIENCY,
      userNote: '해산물 위주로 부탁드려요',
    });

    expect(payload).toEqual({
      start_date: '2026-04-10',
      end_date: '2026-04-12',
      regions: [
        {
          region: 'KR-11',
          start_date: '2026-04-10',
          end_date: '2026-04-12',
        },
      ],
      people_count: 2,
      companion_type: [Companion.FAMILY],
      travel_themes: [TravelTheme.UNIQUE_TRIP],
      pace_preference: PacePreference.DENSE,
      planning_preference: PlanningPreference.PLANNED,
      destination_preference: DestinationPreference.TOURIST_SPOTS,
      activity_preference: ActivityPreference.ACTIVE,
      priority_preference: PriorityPreference.EFFICIENCY,
      notes: '해산물 위주로 부탁드려요',
    });
    expect(payload).not.toHaveProperty('budget_range');
  });
});
