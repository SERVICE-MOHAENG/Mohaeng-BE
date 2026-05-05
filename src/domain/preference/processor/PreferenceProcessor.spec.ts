import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PreferenceProcessor } from './PreferenceProcessor';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { UserPreference } from '../entity/UserPreference.entity';
import { WeatherPreference } from '../entity/WeatherPreference.enum';
import { TravelRange } from '../entity/TravelRange.enum';
import { TravelStyle } from '../entity/TravelStyle.enum';
import { BudgetLevel } from '../entity/BudgetLevel.enum';
import { FoodPersonality } from '../entity/FoodPersonality.enum';
import { MainInterest } from '../entity/MainInterest.enum';

type RecommendPayload = {
  job_id: string;
  weather: WeatherPreference;
  travel_range: TravelRange;
  travel_style: TravelStyle;
  budget_level: BudgetLevel;
  food_personality: FoodPersonality[];
  main_interests: MainInterest[];
};

describe('PreferenceProcessor', () => {
  it('builds Python payload in the AI contract shape', () => {
    const processor = new PreferenceProcessor(
      new ConfigService<Record<string, unknown>>({}),
      new HttpService(),
      {} as PreferenceJobRepository,
      {} as Repository<UserPreference>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buildPythonPayload = (
      processor as unknown as {
        buildPythonPayload: (
          jobId: string,
          preference: UserPreference,
        ) => RecommendPayload;
      }
    ).buildPythonPayload.bind(processor);

    const preference = new UserPreference();
    preference.weatherPreferences = [
      {
        weather: WeatherPreference.OCEAN_BEACH,
      } as UserPreference['weatherPreferences'][number],
    ];
    preference.travelRanges = [
      {
        travelRange: TravelRange.MEDIUM_HAUL,
      } as UserPreference['travelRanges'][number],
    ];
    preference.travelStyles = [
      {
        travelStyle: TravelStyle.MODERN_TRENDY,
      } as UserPreference['travelStyles'][number],
    ];
    preference.budgets = [
      {
        budgetLevel: BudgetLevel.BALANCED,
      } as UserPreference['budgets'][number],
    ];
    preference.foodPersonalities = [
      {
        foodPersonality: FoodPersonality.LOCAL_HIDDEN_GEM,
      } as UserPreference['foodPersonalities'][number],
    ];
    preference.mainInterests = [
      {
        mainInterest: MainInterest.SHOPPING_TOUR,
      } as UserPreference['mainInterests'][number],
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = buildPythonPayload('job-id', preference);

    expect(payload).toEqual({
      job_id: 'job-id',
      weather: WeatherPreference.OCEAN_BEACH,
      travel_range: TravelRange.MEDIUM_HAUL,
      travel_style: TravelStyle.MODERN_TRENDY,
      budget_level: BudgetLevel.BALANCED,
      food_personality: [FoodPersonality.LOCAL_HIDDEN_GEM],
      main_interests: [MainInterest.SHOPPING_TOUR],
    });
  });

  it('builds callback url as the Nest callback base path for AI server', () => {
    const processor = new PreferenceProcessor(
      new ConfigService<Record<string, unknown>>({
        CALLBACK_BASE_URL: 'https://api.mohaeng.kr',
      }),
      new HttpService(),
      {} as PreferenceJobRepository,
      {} as Repository<UserPreference>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buildCallbackUrl = (
      processor as unknown as {
        buildCallbackUrl: () => string;
      }
    ).buildCallbackUrl.bind(processor);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(buildCallbackUrl()).toBe('https://api.mohaeng.kr/api/v1');
  });

  it('preserves callback urls that already include /api/v1', () => {
    const processor = new PreferenceProcessor(
      new ConfigService<Record<string, unknown>>({
        CALLBACK_BASE_URL: 'https://api.mohaeng.kr/api/v1/',
      }),
      new HttpService(),
      {} as PreferenceJobRepository,
      {} as Repository<UserPreference>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buildCallbackUrl = (
      processor as unknown as {
        buildCallbackUrl: () => string;
      }
    ).buildCallbackUrl.bind(processor);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(buildCallbackUrl()).toBe('https://api.mohaeng.kr/api/v1');
  });
});
