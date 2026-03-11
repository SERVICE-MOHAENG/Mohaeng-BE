import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ItineraryModificationCallbackRequest } from './ItineraryModificationCallbackRequest';
import { flattenValidationErrors } from '../../../../../global/validation/flattenValidationErrors';

describe('ItineraryModificationCallbackRequest', () => {
  it('accepts ASK_CLARIFICATION without diff_keys', async () => {
    const payload = plainToInstance(ItineraryModificationCallbackRequest, {
      status: 'ASK_CLARIFICATION',
      message: '어떤 장소를 삭제할까요?',
    });

    const errors = await validate(payload, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors).toHaveLength(0);
  });

  it('keeps SUCCESS strict for modified_itinerary shape', async () => {
    const payload = plainToInstance(ItineraryModificationCallbackRequest, {
      status: 'SUCCESS',
      message: '요청한 일정으로 변경했어요.',
      diff_keys: ['day1_place2'],
      modified_itinerary: {
        start_date: '2026-02-11',
        end_date: '2026-02-11',
        trip_days: 1,
        nights: 0,
        people_count: 2,
        tags: ['도심'],
        title: '서울 당일치기',
        summary: '요약',
        itinerary: [
          {
            day_number: 1,
            daily_date: '2026-02-11',
            places: [
              {
                place_name: '국립현대미술관 서울관',
                place_id: 'place_id_2',
                address: '서울 종로구 삼청로 30',
                latitude: 37.5787,
                longitude: 126.9809,
                place_url: 'https://maps.google.com/?q=mmca',
                description: '도심에서 예술 전시를 즐길 수 있는 공간입니다.',
                visit_sequence: 2,
                visit_time: '11:00',
                duration_minutes: 90,
              },
            ],
          },
        ],
      },
    });

    const errors = await validate(payload, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(flattenValidationErrors(errors)).toContain(
      'modified_itinerary.itinerary.0.places.0.duration_minutes: property duration_minutes should not exist',
    );
  });
});
