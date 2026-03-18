import { ApiProperty } from '@nestjs/swagger';
import { MainPageCourseResponse } from './MainPageCourseResponse';

export class MainPageCoursesResponse {
  @ApiProperty({
    description: '메인페이지 코스 목록',
    type: [MainPageCourseResponse],
  })
  courses: MainPageCourseResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
