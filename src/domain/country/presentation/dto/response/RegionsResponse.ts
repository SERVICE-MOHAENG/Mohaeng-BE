import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../../entity/Region.entity';
import { RegionResponse } from './RegionResponse';

/**
 * RegionsResponse DTO
 * @description
 * - 나라별 도시(지역) 목록 응답
 */
export class RegionsResponse {
  @ApiProperty({ description: '도시 목록', type: [RegionResponse] })
  regions: RegionResponse[];

  static from(regions: Region[]): RegionsResponse {
    const dto = new RegionsResponse();
    dto.regions = regions.map(RegionResponse.from);
    return dto;
  }
}
