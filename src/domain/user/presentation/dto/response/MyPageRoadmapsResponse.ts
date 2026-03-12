import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';
import { MyPagePaginatedResponse } from './MyPagePaginatedResponse';

export class MyPageRoadmapCardResponse {
  @ApiProperty({ description: '로드맵 ID' })
  id: string;

  @ApiProperty({ description: '로드맵 제목' })
  title: string;

  @ApiProperty({ description: '대표 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '여행 일수' })
  days: number;

  @ApiProperty({ description: '숙박 일수' })
  nights: number;

  @ApiProperty({ description: '해시태그 목록', type: [String] })
  hashTags: string[];

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부' })
  isLiked: boolean;

  static fromEntity(
    course: TravelCourse,
    isLiked: boolean,
  ): MyPageRoadmapCardResponse {
    const response = new MyPageRoadmapCardResponse();
    response.id = course.id;
    response.title = course.title;
    response.imageUrl = course.imageUrl ?? null;
    response.days = course.days;
    response.nights = course.nights;
    response.hashTags = course.hashTags?.map((hashTag) => hashTag.tagName) ?? [];
    response.likeCount = course.likeCount;
    response.isLiked = isLiked;
    return response;
  }
}

export class MyPageRoadmapsResponse extends MyPagePaginatedResponse {
  @ApiProperty({
    description: '로드맵 카드 목록',
    type: [MyPageRoadmapCardResponse],
  })
  items: MyPageRoadmapCardResponse[];

  static from(
    items: MyPageRoadmapCardResponse[],
    total: number,
    page: number,
    limit: number,
  ): MyPageRoadmapsResponse {
    const response = new MyPageRoadmapsResponse();
    response.items = items;
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
