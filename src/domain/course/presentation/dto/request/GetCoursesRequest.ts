import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * CourseSortType Enum
 * @description
 * - 여행 코스 정렬 기준
 */
export enum CourseSortType {
  LATEST = 'latest',
  POPULAR = 'popular',
}

/**
 * GetCoursesRequest DTO
 * @description
 * - 여행 코스 목록 조회 요청 (메인페이지)
 * - 국가별 필터링 및 정렬 기준 선택 가능
 */
export class GetCoursesRequest {
  @ApiProperty({
    description: '정렬 기준 (latest: 최신순, popular: 인기순)',
    enum: CourseSortType,
    default: CourseSortType.LATEST,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseSortType)
  sortBy?: CourseSortType = CourseSortType.LATEST;

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
