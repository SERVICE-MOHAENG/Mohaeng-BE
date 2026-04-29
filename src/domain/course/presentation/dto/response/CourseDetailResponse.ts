import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../entity/TravelCourse.entity';
import { CourseDay } from '../../../entity/CourseDay.entity';
import { CoursePlace } from '../../../entity/CoursePlace.entity';
import { ItineraryJob } from '../../../../itinerary/entity/ItineraryJob.entity';
import { PlaceCategory } from '../../../../place/entity/PlaceCategory.enum';

class CourseDetailPlaceResponse {
  @ApiProperty({ description: '장소 이름' })
  place_name: string;

  @ApiProperty({ description: 'Google Places ID' })
  place_id: string;

  @ApiProperty({ description: '주소' })
  address: string;

  @ApiProperty({ description: '위도' })
  latitude: number;

  @ApiProperty({ description: '경도' })
  longitude: number;

  @ApiProperty({ description: 'Google Maps URL' })
  place_url: string;

  @ApiProperty({
    description: 'Mohaeng 장소 대분류 코드',
    enum: PlaceCategory,
  })
  place_category: PlaceCategory;

  @ApiProperty({ description: '장소 설명' })
  description: string;

  @ApiProperty({ description: '방문 순서' })
  visit_sequence: number;

  @ApiProperty({ description: '방문 시각', nullable: true })
  visit_time: string | null;
}

class CourseDetailDayResponse {
  @ApiProperty({ description: '여행 일차' })
  day_number: number;

  @ApiProperty({ description: '해당 날짜 (YYYY-MM-DD)' })
  daily_date: string;

  @ApiProperty({ description: '장소 목록', type: [CourseDetailPlaceResponse] })
  places: CourseDetailPlaceResponse[];
}

class CourseDetailDataResponse {
  @ApiProperty({ description: '로드맵 시작 날짜 (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ description: '로드맵 종료 날짜 (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({ description: '총 여행 일수' })
  trip_days: number;

  @ApiProperty({ description: '총 숙박 수' })
  nights: number;

  @ApiProperty({ description: '총 인원 수' })
  people_count: number;

  @ApiProperty({ description: '여행 완료 여부' })
  is_completed: boolean;

  @ApiProperty({ description: '여행 특징 태그', type: [String] })
  tags: string[];

  @ApiProperty({ description: '짧은 제목' })
  title: string;

  @ApiProperty({ description: '한 줄 설명', nullable: true })
  summary: string | null;

  @ApiProperty({ description: '일자별 일정', type: [CourseDetailDayResponse] })
  itinerary: CourseDetailDayResponse[];

  @ApiProperty({ description: '코스 선정 이유', nullable: true })
  llm_commentary: string | null;

  @ApiProperty({ description: '다음 행동 제안', type: [String] })
  next_action_suggestion: string[];
}

export class CourseDetailResponse {
  @ApiProperty({
    description: '로드맵 상세 데이터',
    type: CourseDetailDataResponse,
  })
  data: CourseDetailDataResponse;

  static fromEntity(
    course: TravelCourse,
    latestGenerationJob?: ItineraryJob | null,
  ): CourseDetailResponse {
    const response = new CourseDetailResponse();
    response.data = {
      start_date: CourseDetailResponse.formatDate(course.travelStartDay),
      end_date: CourseDetailResponse.formatDate(course.travelFinishDay),
      trip_days: course.days,
      nights: course.nights,
      people_count: course.peopleCount,
      is_completed: course.isCompleted ?? false,
      tags: (course.hashTags || []).map((tag) =>
        tag.tagName.startsWith('#') ? tag.tagName.slice(1) : tag.tagName,
      ),
      title: course.title,
      summary: course.description,
      itinerary: CourseDetailResponse.mapDays(course.courseDays || []),
      llm_commentary: latestGenerationJob?.llmCommentary ?? null,
      next_action_suggestion: latestGenerationJob?.nextActionSuggestions || [],
    };
    return response;
  }

  private static mapDays(days: CourseDay[]): CourseDetailDayResponse[] {
    return [...days]
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((day) => ({
        day_number: day.dayNumber,
        daily_date: CourseDetailResponse.formatDate(day.date),
        places: CourseDetailResponse.mapPlaces(day.coursePlaces || []),
      }));
  }

  private static mapPlaces(places: CoursePlace[]): CourseDetailPlaceResponse[] {
    return [...places]
      .sort((a, b) => a.visitOrder - b.visitOrder)
      .map((place) => ({
        place_name: place.place?.name || '',
        place_id: place.place?.placeId || '',
        address: place.place?.address || '',
        latitude: place.place?.latitude ?? 0,
        longitude: place.place?.longitude ?? 0,
        place_url: place.place?.placeUrl || '',
        place_category: place.place?.placeCategory ?? PlaceCategory.OTHER,
        description: place.description || place.place?.description || '',
        visit_sequence: place.visitOrder,
        visit_time: place.visitTime,
      }));
  }

  private static formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
