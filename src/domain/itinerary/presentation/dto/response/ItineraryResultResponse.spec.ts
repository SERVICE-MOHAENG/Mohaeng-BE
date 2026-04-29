import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';
import { ItineraryResultResponse } from './ItineraryResultResponse';
import { PlaceCategory } from '../../../../place/entity/PlaceCategory.enum';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';

describe('ItineraryResultResponse', () => {
  it('includes place_category in SUCCESS itinerary response', () => {
    const job = {
      status: ItineraryStatus.SUCCESS,
      travelCourseId: 'course-id',
      llmCommentary: '설명',
      nextActionSuggestions: ['카페 추가해줘'],
    } as ItineraryJob;

    const course = {
      travelStartDay: new Date('2026-03-01'),
      travelFinishDay: new Date('2026-03-02'),
      days: 2,
      nights: 1,
      peopleCount: 2,
      courseRegions: [],
      hashTags: [],
      title: '서울 투어',
      description: '요약',
      courseDays: [
        {
          dayNumber: 1,
          date: new Date('2026-03-01'),
          coursePlaces: [
            {
              visitOrder: 1,
              visitTime: '09:00',
              description: '설명',
              place: {
                name: '국립현대미술관 서울관',
                placeId: 'place-id-1',
                address: '서울 종로구 삼청로 30',
                latitude: 37.5787,
                longitude: 126.9809,
                placeUrl: 'https://maps.google.com/?q=mmca',
                placeCategory: PlaceCategory.CULTURE,
                description: '장소 설명',
              },
            },
          ],
        },
      ],
    } as unknown as TravelCourse;

    const response = ItineraryResultResponse.from(job, course);

    expect(response.data?.itinerary[0].places[0].place_category).toBe(
      PlaceCategory.CULTURE,
    );
  });
});
