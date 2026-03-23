import { UserVisitedCountryController } from './UserVisitedCountryController';

describe('UserVisitedCountryController', () => {
  it('returns visited country count and paginated items together', async () => {
    const visitedCountryService = {
      findByUserIdWithPagination: jest.fn().mockResolvedValue([
        [
          {
            id: 'visited-country-id',
            visitDate: new Date('2026-03-12'),
            createdAt: new Date('2026-03-13'),
            country: {
              name: '일본',
            },
          },
        ],
        1,
      ]),
    };

    const controller = new UserVisitedCountryController(
      visitedCountryService as any,
    );

    await expect(
      controller.getMyVisitedCountries('user-id', {
        page: 1,
        limit: 10,
      } as any),
    ).resolves.toEqual({
      count: 1,
      items: [
        {
          id: 'visited-country-id',
          countryName: '일본',
          visitDate: new Date('2026-03-12'),
          createdAt: new Date('2026-03-13'),
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    expect(
      visitedCountryService.findByUserIdWithPagination,
    ).toHaveBeenCalledWith('user-id', 1, 10);
  });
});
