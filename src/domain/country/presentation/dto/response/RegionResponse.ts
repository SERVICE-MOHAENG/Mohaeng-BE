import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../../entity/Region.entity';

/**
 * RegionResponse DTO
 * @description
 * - 도시(지역) 단건 응답
 */
export class RegionResponse {
  @ApiProperty({ description: '도시 ID' })
  id: string;

  @ApiProperty({ description: '도시명' })
  name: string;

  @ApiProperty({ description: '도시 이미지 URL', nullable: true })
  imageUrl: string | null;

  static from(region: Region): RegionResponse {
    const dto = new RegionResponse();
    dto.id = region.id;
    dto.name = region.name;
    dto.imageUrl = region.imageUrl;
    return dto;
  }
}
