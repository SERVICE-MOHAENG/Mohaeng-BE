import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from './CourseResponse';

/**
 * CoursesResponse DTO
 * @description
 * - 여행 코스 목록 응답
 */
export class CoursesResponse {
  @ApiProperty({
    description: '코스 목록',
    type: [CourseResponse],
  })
  items: CourseResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
