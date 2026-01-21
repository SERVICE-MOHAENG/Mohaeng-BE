import { ApiProperty } from '@nestjs/swagger';
import { BlogResponse } from './BlogResponse';
import { BlogLike } from '../../../entity/BlogLike.entity';

/**
 * BlogLikesResponse DTO
 * @description
 * - 좋아요한 블로그 목록 응답
 */
export class BlogLikesResponse {
  @ApiProperty({ description: '좋아요한 블로그 목록', type: [BlogResponse] })
  items: BlogResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 항목 수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;

  static from(
    likes: BlogLike[],
    total: number,
    page: number,
    limit: number,
  ): BlogLikesResponse {
    const response = new BlogLikesResponse();
    response.items = likes.map((like) =>
      BlogResponse.fromEntityWithUser(like.travelBlog)
    );
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
