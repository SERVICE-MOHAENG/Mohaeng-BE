import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class SurveyRegionRequest {
  @ApiProperty({ description: '지역명', example: 'SEOUL' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: '지역 방문 시작일', example: '2026-02-07' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: '지역 방문 종료일', example: '2026-02-07' })
  @IsDateString()
  end_date: string;
}

export class CreateSurveyRequest {
  @ApiProperty({ description: '로드맵 시작일', example: '2026-02-07' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: '로드맵 종료일', example: '2026-02-07' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ description: '지역 목록', type: [SurveyRegionRequest] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SurveyRegionRequest)
  regions: SurveyRegionRequest[];

  @ApiProperty({ description: '인원 수', example: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  people_count: number;

  @ApiProperty({
    description: '동행자 유형 목록',
    example: ['FAMILY', 'FRIEND'],
    type: [String],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  companion_type: string[];

  @ApiProperty({
    description: '여행 테마 목록',
    example: ['UNIQUE_TRIP'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  travel_themes: string[];

  @ApiProperty({ description: '여행 스타일(빡빡/널널)', example: 'DENSE' })
  @IsString()
  @IsNotEmpty()
  pace_preference: string;

  @ApiProperty({ description: '여행 스타일(계획/즉흥)', example: 'PLANNED' })
  @IsString()
  @IsNotEmpty()
  planning_preference: string;

  @ApiProperty({
    description: '여행 스타일(관광지/로컬)',
    example: 'TOURIST_SPOTS',
  })
  @IsString()
  @IsNotEmpty()
  destination_preference: string;

  @ApiProperty({ description: '여행 스타일(활동/휴식)', example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty()
  activity_preference: string;

  @ApiProperty({ description: '여행 스타일(효율/감성)', example: 'EFFICIENCY' })
  @IsString()
  @IsNotEmpty()
  priority_preference: string;

  @ApiProperty({ description: '예산 범위', example: 'LOW' })
  @IsString()
  @IsNotEmpty()
  budget_range: string;

  @ApiProperty({ description: '추가 요청 사항', required: false, example: 'string' })
  @IsOptional()
  @IsString()
  notes?: string;
}
