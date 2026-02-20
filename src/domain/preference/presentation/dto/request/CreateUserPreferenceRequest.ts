import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { WeatherPreference } from '../../../entity/WeatherPreference.enum';
import { TravelRange } from '../../../entity/TravelRange.enum';
import { TravelStyle } from '../../../entity/TravelStyle.enum';
import { FoodPersonality } from '../../../entity/FoodPersonality.enum';
import { MainInterest } from '../../../entity/MainInterest.enum';
import { BudgetLevel } from '../../../entity/BudgetLevel.enum';

/**
 * CreateUserPreferenceRequest DTO
 * @description
 * - 사용자 초기 가입 설문 응답 DTO
 * - weather / travel_range / travel_style / budget_level : 단일 선택
 * - food_personality / main_interests                   : 다중 선택 (배열)
 */
export class CreateUserPreferenceRequest {
  @ApiProperty({
    description: '선호 날씨 (단일 선택)',
    enum: WeatherPreference,
    example: WeatherPreference.OCEAN_BEACH,
  })
  @IsEnum(WeatherPreference)
  weather: WeatherPreference;

  @ApiProperty({
    description: '이동 거리 선호 (단일 선택)',
    enum: TravelRange,
    example: TravelRange.MEDIUM_HAUL,
  })
  @IsEnum(TravelRange)
  travel_range: TravelRange;

  @ApiProperty({
    description: '여행 스타일 (단일 선택)',
    enum: TravelStyle,
    example: TravelStyle.MODERN_TRENDY,
  })
  @IsEnum(TravelStyle)
  travel_style: TravelStyle;

  @ApiProperty({
    description: '음식 성향 (다중 선택)',
    enum: FoodPersonality,
    isArray: true,
    example: [FoodPersonality.LOCAL_HIDDEN_GEM],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(FoodPersonality, { each: true })
  food_personality: FoodPersonality[];

  @ApiProperty({
    description: '핵심 관심사 (다중 선택)',
    enum: MainInterest,
    isArray: true,
    example: [MainInterest.SHOPPING_TOUR, MainInterest.DYNAMIC_ACTIVITY],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(MainInterest, { each: true })
  main_interests: MainInterest[];

  @ApiProperty({
    description: '여행 예산 규모 (단일 선택)',
    enum: BudgetLevel,
    example: BudgetLevel.BALANCED,
  })
  @IsEnum(BudgetLevel)
  budget_level: BudgetLevel;
}
