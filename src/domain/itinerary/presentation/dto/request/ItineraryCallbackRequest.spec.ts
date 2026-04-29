import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { flattenValidationErrors } from '../../../../../global/validation/flattenValidationErrors';
import { PlaceCategory } from '../../../../place/entity/PlaceCategory.enum';
import { ItineraryCallbackRequest } from './ItineraryCallbackRequest';

describe('ItineraryCallbackRequest', () => {
  it('accepts SUCCESS payload when places include place_category', async () => {
    const payload = plainToInstance(ItineraryCallbackRequest, {
      status: 'SUCCESS',
      data: {
        start_date: '2026-02-14',
        end_date: '2026-02-16',
        trip_days: 3,
        nights: 2,
        people_count: 2,
        tags: ['예술'],
        title: '서울 전시 투어',
        summary: '요약',
        itinerary: [
          {
            day_number: 1,
            daily_date: '2026-02-14',
            places: [
              {
                place_name: '국립현대미술관 서울관',
                place_id: 'place_id_1',
                address: '서울 종로구 삼청로 30',
                latitude: 37.5787,
                longitude: 126.9809,
                place_url: 'https://maps.google.com/?q=mmca',
                place_category: PlaceCategory.CULTURE,
                description: '도심에서 전시를 즐길 수 있는 공간입니다.',
                visit_sequence: 1,
                visit_time: '10:00',
              },
            ],
          },
        ],
        llm_commentary: '설명',
        next_action_suggestion: ['카페를 추가해줘'],
      },
    });

    const errors = await validate(payload, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects legacy primary_type field in SUCCESS payload', async () => {
    const payload = plainToInstance(ItineraryCallbackRequest, {
      status: 'SUCCESS',
      data: {
        start_date: '2026-02-14',
        end_date: '2026-02-14',
        trip_days: 1,
        nights: 0,
        people_count: 2,
        tags: [],
        title: '서울 당일치기',
        summary: '요약',
        itinerary: [
          {
            day_number: 1,
            daily_date: '2026-02-14',
            places: [
              {
                place_name: '경복궁',
                place_id: 'place_id_legacy',
                address: '서울 종로구 사직로 161',
                latitude: 37.5796,
                longitude: 126.977,
                place_url: 'https://maps.google.com/?q=gyeongbokgung',
                primary_type: 'tourist_attraction',
                description: '설명',
                visit_sequence: 1,
                visit_time: '09:00',
              },
            ],
          },
        ],
        llm_commentary: '설명',
        next_action_suggestion: [],
      },
    });

    const errors = await validate(payload, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(flattenValidationErrors(errors)).toContain(
      'data.itinerary.0.places.0.primary_type: property primary_type should not exist',
    );
  });
});
