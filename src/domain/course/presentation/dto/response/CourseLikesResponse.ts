import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from './CourseResponse';
import { CourseLike } from '../../../entity/CourseLike.entity';

/**
 * CourseLikesResponse DTO
 * @description
 * - 좋아요한 코스 목록 응답
 */
export class CourseLikesResponse {
  @ApiProperty({ description: '좋아요한 코스 목록', type: [CourseResponse] })
  items: CourseResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 항목 수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;

  static from(
    likes: CourseLike[],
    total: number,
    page: number,
    limit: number,
  ): CourseLikesResponse {
    const response = new CourseLikesResponse();
    response.items = likes.map((like) => CourseResponse.fromEntity(like.travelCourse));
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
