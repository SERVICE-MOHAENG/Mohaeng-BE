import { TravelCourse } from '../../../entity/TravelCourse.entity';
import { ItineraryJob } from '../../../../itinerary/entity/ItineraryJob.entity';
import { CourseDetailResponse } from './CourseDetailResponse';

describe('CourseDetailResponse', () => {
  it('maps roadmap detail to AI-style response shape', () => {
    const course = {
      id: 'course-id',
      title: '뉴욕 예술 탐험',
      description: '뉴욕 예술 중심 일정',
      nights: 2,
      days: 3,
      peopleCount: 2,
      isCompleted: true,
      travelStartDay: new Date('2026-02-28'),
      travelFinishDay: new Date('2026-03-02'),
      hashTags: [{ tagName: '#뉴욕' }, { tagName: '#예술' }],
      courseDays: [
        {
          dayNumber: 1,
          date: new Date('2026-02-28'),
          coursePlaces: [
            {
              visitOrder: 1,
              visitTime: '09:00',
              description: '센트럴 파크에서 자연을 만끽하세요.',
              place: {
                name: '센트럴 파크',
                placeId: 'google-place-id',
                address: '뉴욕',
                latitude: 40.1,
                longitude: -73.1,
                placeUrl: 'https://example.com',
                description: '장소 설명',
              },
            },
          ],
        },
      ],
    } as unknown as TravelCourse;

    const job = {
      llmCommentary: '도쿄의 대표 관광지와 먹거리를 균형 있게 구성한 일정입니다.',
      nextActionSuggestions: ['시부야 맛집을 넣어서 1일차 일정을 수정해줘.'],
    } as ItineraryJob;

    const response = CourseDetailResponse.fromEntity(course, job);

    expect(response.data.start_date).toBe('2026-02-28');
    expect(response.data.end_date).toBe('2026-03-02');
    expect(response.data.trip_days).toBe(3);
    expect(response.data.people_count).toBe(2);
    expect(response.data.is_completed).toBe(true);
    expect(response.data.tags).toEqual(['뉴욕', '예술']);
    expect(response.data.itinerary[0].day_number).toBe(1);
    expect(response.data.itinerary[0].places[0].visit_time).toBe('09:00');
    expect(response.data.llm_commentary).toBe(
      '도쿄의 대표 관광지와 먹거리를 균형 있게 구성한 일정입니다.',
    );
    expect(response.data.next_action_suggestion).toEqual([
      '시부야 맛집을 넣어서 1일차 일정을 수정해줘.',
    ]);
  });
});
