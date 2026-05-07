import { PreferenceJobStatus } from '../entity/PreferenceJob.entity';
import { UserPreferenceController } from './UserPreferenceController';

describe('UserPreferenceController', () => {
  it('wraps recommendation job creation like itinerary generation responses', async () => {
    const userPreferenceService = {
      createOrUpdateAndEnqueue: jest.fn().mockResolvedValue({
        jobId: 'job-id',
        status: PreferenceJobStatus.PENDING,
      }),
    };

    const controller = new UserPreferenceController(
      userPreferenceService as any,
      {} as any,
      {} as any,
    );

    await expect(
      controller.createOrUpdate('user-id', {
        weather: 'OCEAN_BEACH',
        travel_range: 'MEDIUM_HAUL',
        travel_style: 'MODERN_TRENDY',
        food_personality: ['LOCAL_HIDDEN_GEM'],
        main_interests: ['SHOPPING_TOUR'],
        budget_level: 'BALANCED',
      } as any),
    ).resolves.toEqual({
      preference: {
        jobId: 'job-id',
        status: PreferenceJobStatus.PENDING,
      },
    });

    expect(userPreferenceService.createOrUpdateAndEnqueue).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        weather: 'OCEAN_BEACH',
        travelRange: 'MEDIUM_HAUL',
        travelStyle: 'MODERN_TRENDY',
        foodPersonalities: ['LOCAL_HIDDEN_GEM'],
        mainInterests: ['SHOPPING_TOUR'],
        budget: 'BALANCED',
      },
    );
  });
});
