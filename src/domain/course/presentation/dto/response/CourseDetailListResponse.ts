import { ApiProperty } from '@nestjs/swagger';
import { CourseDetailResponse } from './CourseDetailResponse';
import { TravelCourse } from '../../../entity/TravelCourse.entity';
import { ItineraryJob } from '../../../../itinerary/entity/ItineraryJob.entity';

export class CourseDetailListResponse {
  @ApiProperty({
    description: '로드맵 목록',
    type: [CourseDetailResponse],
  })
  courses: CourseDetailResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;

  static from(
    courses: TravelCourse[],
    total: number,
    page: number,
    limit: number,
    latestGenerationJobs: Map<string, ItineraryJob> = new Map(),
  ): CourseDetailListResponse {
    const response = new CourseDetailListResponse();
    response.courses = courses.map((course) =>
      CourseDetailResponse.fromEntity(
        course,
        latestGenerationJobs.get(course.id) ?? null,
      ),
    );
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
