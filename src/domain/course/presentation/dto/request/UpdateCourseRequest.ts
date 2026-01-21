import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * UpdateCourseRequest DTO
 * @description
 * - 여행 코스 수정 요청
 */
export class UpdateCourseRequest {
  @ApiProperty({
    description: '여행 코스 제목 (1~100자)',
    example: '도쿄 3박 4일 여행',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: '여행 코스 설명 (최대 1000자)',
    example: '벚꽃 시즌에 즐기는 도쿄 여행',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: '숙박 일수 (몇 박)',
    example: 3,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nights?: number;

  @ApiProperty({
    description: '여행 일수 (몇 일)',
    example: 4,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;

  @ApiProperty({
    description: '공개 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
