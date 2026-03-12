import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../../../country/entity/Region.entity';
import { MyPagePaginatedResponse } from './MyPagePaginatedResponse';

export class MyPageRegionCardResponse {
  @ApiProperty({ description: '지역 ID' })
  regionId: string;

  @ApiProperty({ description: '지역명' })
  regionName: string;

  @ApiProperty({ description: '지역 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '지역 설명', nullable: true })
  description: string | null;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부' })
  isLiked: boolean;

  static fromRegion(
    region: Region,
    likeCount: number,
    isLiked: boolean,
  ): MyPageRegionCardResponse {
    const response = new MyPageRegionCardResponse();
    response.regionId = region.id;
    response.regionName = region.name;
    response.imageUrl = region.imageUrl ?? null;
    response.description = region.regionDescription ?? null;
    response.likeCount = likeCount;
    response.isLiked = isLiked;
    return response;
  }
}

export class MyPageLikedRegionsResponse extends MyPagePaginatedResponse {
  @ApiProperty({
    description: '좋아요한 여행지 카드 목록',
    type: [MyPageRegionCardResponse],
  })
  items: MyPageRegionCardResponse[];

  static from(
    items: MyPageRegionCardResponse[],
    total: number,
    page: number,
    limit: number,
  ): MyPageLikedRegionsResponse {
    const response = new MyPageLikedRegionsResponse();
    response.items = items;
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
