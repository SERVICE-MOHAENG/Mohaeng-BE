import { ApiProperty } from '@nestjs/swagger';
import { TravelBlog } from '../../../../blog/entity/TravelBlog.entity';
import { MyPagePaginatedResponse } from './MyPagePaginatedResponse';

export class MyPageBlogCardResponse {
  @ApiProperty({ description: '블로그 ID' })
  id: string;

  @ApiProperty({ description: '블로그 제목' })
  title: string;

  @ApiProperty({ description: '대표 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부' })
  isLiked: boolean;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  static fromEntity(
    blog: TravelBlog,
    isLiked: boolean,
  ): MyPageBlogCardResponse {
    const response = new MyPageBlogCardResponse();
    response.id = blog.id;
    response.title = blog.title;
    response.imageUrl = blog.imageUrl ?? null;
    response.likeCount = blog.likeCount;
    response.isLiked = isLiked;
    response.createdAt = blog.createdAt;
    return response;
  }
}

export class MyPageBlogsResponse extends MyPagePaginatedResponse {
  @ApiProperty({
    description: '블로그 카드 목록',
    type: [MyPageBlogCardResponse],
  })
  items: MyPageBlogCardResponse[];

  static from(
    items: MyPageBlogCardResponse[],
    total: number,
    page: number,
    limit: number,
  ): MyPageBlogsResponse {
    const response = new MyPageBlogsResponse();
    response.items = items;
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
