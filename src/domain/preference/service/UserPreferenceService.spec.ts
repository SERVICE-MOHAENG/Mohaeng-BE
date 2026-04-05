import { DataSource } from 'typeorm';
import { Queue } from 'bullmq';
import { BudgetLevel } from '../entity/BudgetLevel.enum';
import { FoodPersonality } from '../entity/FoodPersonality.enum';
import { MainInterest } from '../entity/MainInterest.enum';
import {
  PreferenceJob,
  PreferenceJobStatus,
} from '../entity/PreferenceJob.entity';
import { TravelRange } from '../entity/TravelRange.enum';
import { TravelStyle } from '../entity/TravelStyle.enum';
import { UserPreference } from '../entity/UserPreference.entity';
import { WeatherPreference } from '../entity/WeatherPreference.enum';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { UserPreferenceRepository } from '../persistence/UserPreferenceRepository';
import { UserPreferenceService } from './UserPreferenceService';

describe('UserPreferenceService', () => {
  const createPreference = (id = 'preference-id'): UserPreference => {
    const preference = UserPreference.create('user-id');
    preference.id = id;
    return preference;
  };

  const createRequest = () => ({
    userId: 'user-id',
    weather: WeatherPreference.OCEAN_BEACH,
    travelRange: TravelRange.MEDIUM_HAUL,
    travelStyle: TravelStyle.MODERN_TRENDY,
    foodPersonalities: [FoodPersonality.LOCAL_HIDDEN_GEM],
    mainInterests: [MainInterest.SHOPPING_TOUR],
    budget: BudgetLevel.BALANCED,
  });

  const createService = ({
    userPreferenceRepository = {},
    preferenceJobRepository = {},
    dataSource = {},
    preferenceQueue = {},
  }: {
    userPreferenceRepository?: Record<string, jest.Mock>;
    preferenceJobRepository?: Record<string, jest.Mock>;
    dataSource?: Record<string, jest.Mock>;
    preferenceQueue?: Record<string, jest.Mock>;
  } = {}) => {
    const mergedUserPreferenceRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      existsByUserId: jest.fn(),
      delete: jest.fn(),
      ...userPreferenceRepository,
    };
    const mergedPreferenceJobRepository = {
      save: jest.fn(),
      ...preferenceJobRepository,
    };
    const mergedDataSource = {
      transaction: jest.fn(),
      ...dataSource,
    };
    const mergedPreferenceQueue = {
      add: jest.fn(),
      ...preferenceQueue,
    };

    const service = new UserPreferenceService(
      mergedUserPreferenceRepository as unknown as UserPreferenceRepository,
      mergedPreferenceJobRepository as unknown as PreferenceJobRepository,
      mergedDataSource as unknown as DataSource,
      mergedPreferenceQueue as unknown as Queue,
    );

    jest
      .spyOn(service, 'createOrUpdate')
      .mockResolvedValue(createPreference('preference-id'));

    return {
      service,
      userPreferenceRepository: mergedUserPreferenceRepository,
      preferenceJobRepository: mergedPreferenceJobRepository,
      dataSource: mergedDataSource,
      preferenceQueue: mergedPreferenceQueue,
    };
  };

  it('creates a preference job and enqueues recommendation work', async () => {
    const savedJob = PreferenceJob.create('user-id', 'preference-id');
    savedJob.id = 'job-id';
    const { service, preferenceJobRepository, preferenceQueue } = createService(
      {
        preferenceJobRepository: {
          save: jest.fn().mockResolvedValue(savedJob),
        },
      },
    );

    const result = await service.createOrUpdateAndEnqueue(createRequest());

    expect(preferenceJobRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        preferenceId: 'preference-id',
        status: PreferenceJobStatus.PENDING,
      }),
    );
    expect(preferenceQueue.add).toHaveBeenCalledWith(
      'recommend',
      {
        jobId: 'job-id',
        preferenceId: 'preference-id',
      },
      expect.objectContaining({
        attempts: 3,
      }),
    );
    expect(result).toEqual({
      jobId: 'job-id',
      status: PreferenceJobStatus.PENDING,
    });
  });

  it('marks the job as failed when queue registration fails', async () => {
    const savedJob = PreferenceJob.create('user-id', 'preference-id');
    savedJob.id = 'job-id';
    const markFailedSpy = jest.spyOn(savedJob, 'markFailed');
    const queueError = new Error('queue failed');
    const { service, preferenceJobRepository, preferenceQueue } = createService(
      {
        preferenceJobRepository: {
          save: jest
            .fn()
            .mockResolvedValueOnce(savedJob)
            .mockImplementationOnce((job: PreferenceJob) =>
              Promise.resolve(job),
            ),
        },
        preferenceQueue: {
          add: jest.fn().mockRejectedValue(queueError),
        },
      },
    );

    await expect(
      service.createOrUpdateAndEnqueue(createRequest()),
    ).rejects.toThrow(queueError);

    expect(preferenceQueue.add).toHaveBeenCalledTimes(1);
    expect(markFailedSpy).toHaveBeenCalledWith(
      'QUEUE_ERROR',
      '추천 작업 큐 등록에 실패했습니다',
    );
    expect(preferenceJobRepository.save).toHaveBeenCalledTimes(2);
    expect(preferenceJobRepository.save).toHaveBeenLastCalledWith(savedJob);
    expect(savedJob.status).toBe(PreferenceJobStatus.FAILED);
  });
});
