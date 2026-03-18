import { CourseResponse } from './CourseResponse';
import { TravelCourse } from '../../../entity/TravelCourse.entity';

describe('CourseResponse', () => {
  it('keeps parent day numbers when flattening course places', () => {
    const course = {
      id: 'course-id',
      title: '뉴욕 예술 탐험',
      description: null,
      imageUrl: null,
      viewCount: 0,
      nights: 2,
      days: 3,
      likeCount: 0,
      modificationCount: 2,
      user: { id: 'user-id', name: '동건 하' },
      courseCountries: [],
      courseRegions: [],
      hashTags: [],
      isPublic: false,
      isCompleted: false,
      sourceCourseId: null,
      createdAt: new Date('2026-03-16T14:17:26.636Z'),
      updatedAt: new Date('2026-03-16T14:17:26.636Z'),
      courseDays: [
        {
          dayNumber: 2,
          coursePlaces: [
            {
              id: 'place-day-2',
              visitOrder: 1,
              memo: null,
              place: {
                placeId: 'place-id-2',
                name: '둘째 날 장소',
                description: '둘째 날 설명',
                latitude: 0,
                longitude: 0,
                address: 'day2 address',
                placeUrl: 'https://example.com/day2',
              },
            },
          ],
        },
        {
          dayNumber: 3,
          coursePlaces: [
            {
              id: 'place-day-3',
              visitOrder: 1,
              memo: null,
              place: {
                placeId: 'place-id-3',
                name: '셋째 날 장소',
                description: '셋째 날 설명',
                latitude: 0,
                longitude: 0,
                address: 'day3 address',
                placeUrl: 'https://example.com/day3',
              },
            },
          ],
        },
      ],
    } as unknown as TravelCourse;

    const response = CourseResponse.fromEntity(course);

    expect(response.places).toHaveLength(2);
    expect(response.places[0].dayNumber).toBe(2);
    expect(response.places[1].dayNumber).toBe(3);
  });
});
