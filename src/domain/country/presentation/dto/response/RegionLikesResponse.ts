import { ApiProperty } from '@nestjs/swagger';
import { LikedRegionResponse } from './LikedRegionResponse';

export class RegionLikesResponse {
  @ApiProperty({
    description: '좋아요한 지역 목록',
    type: [LikedRegionResponse],
  })
  items: LikedRegionResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 항목 수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
