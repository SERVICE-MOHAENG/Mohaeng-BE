import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * AddVisitedCountryRequest DTO
 * @description
 * - 방문 국가 추가 요청
 */
export class AddVisitedCountryRequest {
  @ApiProperty({
    description: '국가 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  countryId: string;

  @ApiProperty({
    description: '방문 날짜 (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜는 YYYY-MM-DD 형식이어야 합니다',
  })
  visitDate: string;
}
