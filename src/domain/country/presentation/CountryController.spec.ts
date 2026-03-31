import { CountryController } from './CountryController';

describe('CountryController', () => {
  it('returns all countries from the database', async () => {
    const countryService = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: 'country-jp',
          name: '일본',
          code: 'JP',
          imageUrl: 'https://example.com/jp.jpg',
          countryCode: 'JP',
          continent: 'ASIA',
        },
        {
          id: 'country-us',
          name: '미국',
          code: 'US',
          imageUrl: null,
          countryCode: 'US',
          continent: 'NORTH_AMERICA',
        },
      ]),
    };
    const controller = new CountryController(
      countryService as any,
      {} as any,
    );

    await expect(controller.getCountries()).resolves.toEqual({
      countries: [
        {
          id: 'country-jp',
          name: '일본',
          code: 'JP',
          imageUrl: 'https://example.com/jp.jpg',
          countryCode: 'JP',
          continent: 'ASIA',
        },
        {
          id: 'country-us',
          name: '미국',
          code: 'US',
          imageUrl: null,
          countryCode: 'US',
          continent: 'NORTH_AMERICA',
        },
      ],
    });

    expect(countryService.findAll).toHaveBeenCalled();
  });
});
