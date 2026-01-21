import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * GetCoursesRequest DTO
 * @description
 * - 여행 코스 목록 조회 요청 (메인페이지)
 * - 국가별 필터링 및 하트순(좋아요순) 정렬
 */
export class GetCoursesRequest {
  @ApiProperty({
    description: '국가 코드 (ISO 3166-1 alpha-2, 필터링용)',
    required: false,
    example: 'JP',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({
    description: '페이지 번호',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지 크기 (최대 10개)',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number = 10;
}
