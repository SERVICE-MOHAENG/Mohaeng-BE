import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * BlogSortType Enum
 * @description
 * - 블로그 정렬 기준
 */
export enum BlogSortType {
  LATEST = 'latest',
  POPULAR = 'popular',
}

/**
 * GetBlogsRequest DTO
 * @description
 * - 여행 블로그 목록 조회 요청 (메인페이지)
 */
export class GetBlogsRequest {
  @ApiProperty({
    description: '정렬 기준 (latest: 최신순, popular: 인기순)',
    enum: BlogSortType,
    default: BlogSortType.LATEST,
    required: false,
  })
  @IsOptional()
  @IsEnum(BlogSortType)
  sortBy?: BlogSortType = BlogSortType.LATEST;

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
    description: '페이지 크기',
    default: 6,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 6;
}
