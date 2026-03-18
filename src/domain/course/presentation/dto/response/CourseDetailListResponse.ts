import { ApiProperty } from '@nestjs/swagger';
import { CourseDetailResponse } from './CourseDetailResponse';

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
}
