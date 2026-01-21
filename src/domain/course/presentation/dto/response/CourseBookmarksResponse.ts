import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from './CourseResponse';
import { CourseBookmark } from '../../../entity/CourseBookmark.entity';

/**
 * CourseBookmarksResponse DTO
 * @description
 * - 북마크한 코스 목록 응답
 */
export class CourseBookmarksResponse {
  @ApiProperty({ description: '북마크한 코스 목록', type: [CourseResponse] })
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
    bookmarks: CourseBookmark[],
    total: number,
    page: number,
    limit: number,
  ): CourseBookmarksResponse {
    const response = new CourseBookmarksResponse();
    response.items = bookmarks.map((bookmark) =>
      CourseResponse.fromEntity(bookmark.travelCourse),
    );
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
