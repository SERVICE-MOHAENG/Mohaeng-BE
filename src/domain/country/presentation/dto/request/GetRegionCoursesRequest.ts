import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  CourseSortType,
  normalizeCourseSortType,
} from '../../../../course/presentation/dto/request/GetCoursesRequest';

export class GetRegionCoursesRequest {
  @ApiProperty({
    description: '정렬 기준 (latest: 최신순, popular: 인기순)',
    enum: CourseSortType,
    required: false,
    default: CourseSortType.LATEST,
  })
  @IsOptional()
  @Transform(normalizeCourseSortType)
  @IsEnum(CourseSortType)
  sortBy?: CourseSortType = CourseSortType.LATEST;

  @ApiProperty({ description: '페이지 번호', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지 크기',
    required: false,
    default: 10,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}
