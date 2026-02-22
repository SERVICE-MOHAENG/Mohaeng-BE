import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * GetRegionsByCountryRequest DTO
 * @description
 * - 나라 이름으로 도시 목록 조회 요청
 */
export class GetRegionsByCountryRequest {
  @ApiProperty({
    description: '나라 이름',
    example: '미국',
  })
  @IsNotEmpty()
  @IsString()
  countryName: string;
}
