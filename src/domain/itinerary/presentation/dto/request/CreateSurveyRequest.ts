import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SurveyBudget } from '../../../../course/entity/SurveyBudget.enum';
import { PacePreference } from '../../../../course/entity/PacePreference.enum';
import { PlanningPreference } from '../../../../course/entity/PlanningPreference.enum';
import { DestinationPreference } from '../../../../course/entity/DestinationPreference.enum';
import { ActivityPreference } from '../../../../course/entity/ActivityPreference.enum';
import { PriorityPreference } from '../../../../course/entity/PriorityPreference.enum';
import { Companion } from '../../../../course/entity/Companion.enum';
import { TravelTheme } from '../../../../course/entity/TravelTheme.enum';

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
    enum: Companion,
    isArray: true,
    example: [Companion.FAMILY],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Companion, { each: true })
  companion_type: Companion[];

  @ApiProperty({
    description: '여행 테마 목록',
    enum: TravelTheme,
    isArray: true,
    example: [TravelTheme.UNIQUE_TRIP],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TravelTheme, { each: true })
  travel_themes: TravelTheme[];

  @ApiProperty({
    description: '일정 밀도 선호',
    enum: PacePreference,
    example: PacePreference.DENSE,
  })
  @IsEnum(PacePreference)
  pace_preference: PacePreference;

  @ApiProperty({
    description: '계획 성향',
    enum: PlanningPreference,
    example: PlanningPreference.PLANNED,
  })
  @IsEnum(PlanningPreference)
  planning_preference: PlanningPreference;

  @ApiProperty({
    description: '여행지 선호',
    enum: DestinationPreference,
    example: DestinationPreference.TOURIST_SPOTS,
  })
  @IsEnum(DestinationPreference)
  destination_preference: DestinationPreference;

  @ApiProperty({
    description: '활동 선호',
    enum: ActivityPreference,
    example: ActivityPreference.ACTIVE,
  })
  @IsEnum(ActivityPreference)
  activity_preference: ActivityPreference;

  @ApiProperty({
    description: '우선 가치',
    enum: PriorityPreference,
    example: PriorityPreference.EFFICIENCY,
  })
  @IsEnum(PriorityPreference)
  priority_preference: PriorityPreference;

  @ApiProperty({
    description: '예산 범위',
    enum: SurveyBudget,
    example: SurveyBudget.LOW,
  })
  @IsEnum(SurveyBudget)
  budget_range: SurveyBudget;

  @ApiProperty({ description: '추가 요청 사항', required: false, example: '해산물 위주로 부탁드려요' })
  @IsOptional()
  @IsString()
  notes?: string;
}
