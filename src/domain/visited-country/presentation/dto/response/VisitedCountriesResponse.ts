import { ApiProperty } from '@nestjs/swagger';
import { VisitedCountryResponse } from './VisitedCountryResponse';

/**
 * VisitedCountriesResponse DTO
 * @description
 * - 방문 국가 목록 응답
 */
export class VisitedCountriesResponse {
  @ApiProperty({
    description: '방문 국가 목록',
    type: [VisitedCountryResponse],
  })
  items: VisitedCountryResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
