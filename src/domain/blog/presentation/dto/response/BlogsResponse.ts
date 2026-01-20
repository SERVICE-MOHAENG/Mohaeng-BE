import { ApiProperty } from '@nestjs/swagger';
import { BlogResponse } from './BlogResponse';

/**
 * BlogsResponse DTO
 * @description
 * - 여행 블로그 목록 응답
 */
export class BlogsResponse {
  @ApiProperty({
    description: '블로그 목록',
    type: [BlogResponse],
  })
  blogs: BlogResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
