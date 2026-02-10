import { ApiProperty } from '@nestjs/swagger';
import { ItineraryJob } from '../../../entity/ItineraryJob.entity';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';
import { CourseDay } from '../../../../course/entity/CourseDay.entity';
import { CoursePlace } from '../../../../course/entity/CoursePlace.entity';
import { CourseRegion } from '../../../../course/entity/CourseRegion.entity';

class ItineraryPlaceResultResponse {
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

  @ApiProperty({ description: '장소 설명' })
  description: string;

  @ApiProperty({ description: '방문 순서' })
  visit_sequence: number;

  @ApiProperty({ description: '방문 시각', nullable: true })
  visit_time: string | null;
}

class ItineraryRegionResultResponse {
  @ApiProperty({ description: '지역명' })
  region_name: string;

  @ApiProperty({ description: '지역 방문 시작일 (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ description: '지역 방문 종료일 (YYYY-MM-DD)' })
  end_date: string;
}

class ItineraryDayResultResponse {
  @ApiProperty({ description: '여행 일차' })
  day_number: number;

  @ApiProperty({ description: '날짜 (YYYY-MM-DD)' })
  daily_date: string;

  @ApiProperty({ description: '장소 목록', type: [ItineraryPlaceResultResponse] })
  places: ItineraryPlaceResultResponse[];
}

class ItineraryDataResultResponse {
  @ApiProperty({ description: '여행 시작일 (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ description: '여행 종료일 (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({ description: '총 여행 일수' })
  trip_days: number;

  @ApiProperty({ description: '총 숙박 수' })
  nights: number;

  @ApiProperty({ description: '총 인원 수' })
  people_count: number;

  @ApiProperty({ description: '지역 목록', type: [ItineraryRegionResultResponse] })
  regions: ItineraryRegionResultResponse[];

  @ApiProperty({ description: '태그 목록', type: [String] })
  tags: string[];

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '요약', nullable: true })
  summary: string | null;

  @ApiProperty({ description: '일자별 일정', type: [ItineraryDayResultResponse] })
  itinerary: ItineraryDayResultResponse[];

  @ApiProperty({ description: 'LLM 코멘터리' })
  llm_commentary: string | null;

  @ApiProperty({ description: '다음 행동 제안', type: [String] })
  next_action_suggestion: string[];
}

class ItineraryErrorResultResponse {
  @ApiProperty({ description: '에러 코드' })
  code: string;

  @ApiProperty({ description: '에러 메시지' })
  message: string;
}

export class ItineraryResultResponse {
  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  @ApiProperty({
    description: '생성 결과 데이터 (SUCCESS 시)',
    nullable: true,
    type: ItineraryDataResultResponse,
  })
  data: ItineraryDataResultResponse | null;

  @ApiProperty({
    description: '실패 정보 (FAILED 시)',
    nullable: true,
    type: ItineraryErrorResultResponse,
  })
  error: ItineraryErrorResultResponse | null;

  static from(
    job: ItineraryJob,
    course?: TravelCourse | null,
  ): ItineraryResultResponse {
    const response = new ItineraryResultResponse();
    response.status = job.status;
    response.data = null;
    response.error = null;

    if (job.status === ItineraryStatus.SUCCESS && course) {
      response.data = {
        start_date: ItineraryResultResponse.formatDate(course.travelStartDay),
        end_date: ItineraryResultResponse.formatDate(course.travelFinishDay),
        trip_days: course.days,
        nights: course.nights,
        people_count: course.peopleCount,
        regions: ItineraryResultResponse.mapRegions(course.courseRegions || []),
        tags:
          (course.hashTags || []).map((tag) =>
            tag.tagName.startsWith('#') ? tag.tagName.slice(1) : tag.tagName,
          ),
        title: course.title,
        summary: course.description,
        itinerary: ItineraryResultResponse.mapDays(course.courseDays || []),
        llm_commentary: job.llmCommentary,
        next_action_suggestion: job.nextActionSuggestions || [],
      };
    }

    if (job.status === ItineraryStatus.FAILED) {
      response.error = {
        code: job.errorCode || 'UNKNOWN_ERROR',
        message: job.errorMessage || '알 수 없는 오류',
      };
    }

    return response;
  }

  private static mapRegions(
    regions: CourseRegion[],
  ): ItineraryRegionResultResponse[] {
    return regions.map((region) => ({
      region_name: region.regionName,
      start_date: ItineraryResultResponse.formatDate(region.startDate),
      end_date: ItineraryResultResponse.formatDate(region.endDate),
    }));
  }

  private static mapDays(days: CourseDay[]): ItineraryDayResultResponse[] {
    return [...days]
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((day) => ({
        day_number: day.dayNumber,
        daily_date: ItineraryResultResponse.formatDate(day.date),
        places: ItineraryResultResponse.mapPlaces(day.coursePlaces || []),
      }));
  }

  private static mapPlaces(
    places: CoursePlace[],
  ): ItineraryPlaceResultResponse[] {
    return [...places]
      .sort((a, b) => a.visitOrder - b.visitOrder)
      .map((place) => ({
        place_name: place.place?.name || '',
        place_id: place.place?.placeId || '',
        address: place.place?.address || '',
        latitude: place.place?.latitude ?? 0,
        longitude: place.place?.longitude ?? 0,
        place_url: place.place?.placeUrl || '',
        description: place.description || place.place?.description || '',
        visit_sequence: place.visitOrder,
        visit_time: place.visitTime,
      }));
  }

  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
