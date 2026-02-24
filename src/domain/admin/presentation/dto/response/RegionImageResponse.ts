import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../../../country/entity/Region.entity';

export class RegionImageResponse {
  @ApiProperty({ description: '도시 ID' })
  id: string;

  @ApiProperty({ description: '도시명' })
  name: string;

  @ApiProperty({ description: '업데이트된 이미지 URL', nullable: true })
  imageUrl: string | null;

  static from(region: Region): RegionImageResponse {
    const dto = new RegionImageResponse();
    dto.id = region.id;
    dto.name = region.name;
    dto.imageUrl = region.imageUrl;
    return dto;
  }
}
