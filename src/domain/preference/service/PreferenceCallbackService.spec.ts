import { Repository } from 'typeorm';
import { PreferenceJobStatus } from '../entity/PreferenceJob.entity';
import { PreferenceRecommendation } from '../entity/PreferenceRecommendation.entity';
import { PreferenceJobNotFoundException } from '../exception/PreferenceJobNotFoundException';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { RegionRepository } from '../../country/persistence/RegionRepository';
import { PreferenceCallbackService } from './PreferenceCallbackService';

describe('PreferenceCallbackService', () => {
  const createService = ({
    preferenceJobRepository = {},
    recommendationRepository = {},
    regionRepository = {},
  }: {
    preferenceJobRepository?: Record<string, jest.Mock>;
    recommendationRepository?: Record<string, jest.Mock>;
    regionRepository?: Record<string, jest.Mock>;
  } = {}) => {
    const mergedPreferenceJobRepository = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      ...preferenceJobRepository,
    };
    const mergedRecommendationRepository = {
      find: jest.fn(),
      save: jest.fn(),
      ...recommendationRepository,
    };
    const mergedRegionRepository = {
      findByName: jest.fn(),
      ...regionRepository,
    };

    const service = new PreferenceCallbackService(
      mergedPreferenceJobRepository as unknown as PreferenceJobRepository,
      mergedRecommendationRepository as unknown as Repository<PreferenceRecommendation>,
      mergedRegionRepository as unknown as RegionRepository,
    );

    return {
      service,
      preferenceJobRepository: mergedPreferenceJobRepository,
      recommendationRepository: mergedRecommendationRepository,
    };
  };

  it('returns job status only for the owning user', async () => {
    const { service, preferenceJobRepository } = createService({
      preferenceJobRepository: {
        findByIdAndUserId: jest.fn().mockResolvedValue({
          id: 'job-id',
          userId: 'user-id',
          status: PreferenceJobStatus.SUCCESS,
        }),
      },
    });

    const status = await service.getJobStatus('user-id', 'job-id');

    expect(preferenceJobRepository.findByIdAndUserId).toHaveBeenCalledWith(
      'job-id',
      'user-id',
    );
    expect(status).toBe(PreferenceJobStatus.SUCCESS);
  });

  it('throws when fetching recommendations for a job not owned by the user', async () => {
    const { service, preferenceJobRepository, recommendationRepository } =
      createService({
        preferenceJobRepository: {
          findByIdAndUserId: jest.fn().mockResolvedValue(null),
        },
      });

    await expect(
      service.getRecommendations('user-id', 'job-id'),
    ).rejects.toBeInstanceOf(PreferenceJobNotFoundException);

    expect(preferenceJobRepository.findByIdAndUserId).toHaveBeenCalledWith(
      'job-id',
      'user-id',
    );
    expect(recommendationRepository.find).not.toHaveBeenCalled();
  });

  it('loads recommendations only after verifying job ownership', async () => {
    const recommendation = PreferenceRecommendation.create(
      'job-id',
      'Seoul',
      'region-id',
    );
    const recommendations = [recommendation];
    const { service, preferenceJobRepository, recommendationRepository } =
      createService({
        preferenceJobRepository: {
          findByIdAndUserId: jest.fn().mockResolvedValue({
            id: 'job-id',
            userId: 'user-id',
          }),
        },
        recommendationRepository: {
          find: jest.fn().mockResolvedValue(recommendations),
        },
      });

    const result = await service.getRecommendations('user-id', 'job-id');

    expect(preferenceJobRepository.findByIdAndUserId).toHaveBeenCalledWith(
      'job-id',
      'user-id',
    );
    expect(recommendationRepository.find).toHaveBeenCalledWith({
      where: { jobId: 'job-id' },
      relations: ['region'],
      order: { createdAt: 'ASC' },
    });
    expect(result).toBe(recommendations);
  });
});
