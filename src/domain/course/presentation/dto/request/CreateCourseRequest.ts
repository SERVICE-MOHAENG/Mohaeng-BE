import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * CreateCourseRequest DTO
 * @description
 * - 여행 코스 생성 요청
 */
export class CreateCourseRequest {
  @ApiProperty({
    description: '여행 코스 제목 (1~100자)',
    example: '도쿄 3박 4일 여행',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

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
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nights: number;

  @ApiProperty({
    description: '여행 일수 (몇 일)',
    example: 4,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days: number;

  @ApiProperty({
    description: '공개 여부',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}
