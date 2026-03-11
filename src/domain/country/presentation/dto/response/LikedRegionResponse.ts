import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../../entity/Region.entity';

export class LikedRegionResponse {
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
  ): LikedRegionResponse {
    const response = new LikedRegionResponse();
    response.regionId = region.id;
    response.regionName = region.name;
    response.imageUrl = region.imageUrl ?? null;
    response.description = region.regionDescription ?? null;
    response.likeCount = likeCount;
    response.isLiked = isLiked;
    return response;
  }
}
