import { UserVisitedCountryService } from './UserVisitedCountryService';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';

describe('UserVisitedCountryService', () => {
  it('returns the stored visited country count from the user entity', async () => {
    const service = new UserVisitedCountryService(
      {} as any,
      {
        findById: jest.fn().mockResolvedValue({
          id: 'user-id',
          visitedCountries: 16,
        }),
      } as any,
    );

    await expect(service.getVisitedCountryCount('user-id')).resolves.toBe(16);
  });

  it('throws when the user does not exist', async () => {
    const service = new UserVisitedCountryService(
      {} as any,
      {
        findById: jest.fn().mockResolvedValue(null),
      } as any,
    );

    await expect(
      service.getVisitedCountryCount('missing-user-id'),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
