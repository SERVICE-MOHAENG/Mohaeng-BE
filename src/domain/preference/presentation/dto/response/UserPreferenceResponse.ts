import { ApiProperty } from '@nestjs/swagger';
import { UserPreference } from '../../../entity/UserPreference.entity';
import { WeatherPreference } from '../../../entity/WeatherPreference.enum';
import { TravelRange } from '../../../entity/TravelRange.enum';
import { TravelStyle } from '../../../entity/TravelStyle.enum';
import { FoodPersonality } from '../../../entity/FoodPersonality.enum';
import { MainInterest } from '../../../entity/MainInterest.enum';
import { BudgetLevel } from '../../../entity/BudgetLevel.enum';

/**
 * UserPreferenceResponse DTO
 * @description
 * - 사용자 선호도 응답 DTO
 */
export class UserPreferenceResponse {
  @ApiProperty({ description: '선호도 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ enum: WeatherPreference, description: '선호 날씨 (단일)' })
  weather: WeatherPreference;

  @ApiProperty({ enum: TravelRange, description: '이동 거리 선호 (단일)' })
  travelRange: TravelRange;

  @ApiProperty({ enum: TravelStyle, description: '여행 스타일 (단일)' })
  travelStyle: TravelStyle;

  @ApiProperty({ enum: FoodPersonality, isArray: true, description: '음식 성향 (다중)' })
  foodPersonality: FoodPersonality[];

  @ApiProperty({ enum: MainInterest, isArray: true, description: '핵심 관심사 (다중)' })
  mainInterests: MainInterest[];

  @ApiProperty({ enum: BudgetLevel, description: '예산 규모 (단일)' })
  budgetLevel: BudgetLevel;

  static from(preference: UserPreference): UserPreferenceResponse {
    const res = new UserPreferenceResponse();
    res.id = preference.id;
    res.userId = preference.userId;
    res.weather = preference.weatherPreferences?.[0]?.weather;
    res.travelRange = preference.travelRanges?.[0]?.travelRange;
    res.travelStyle = preference.travelStyles?.[0]?.travelStyle;
    res.foodPersonality = preference.foodPersonalities?.map((f) => f.foodPersonality) ?? [];
    res.mainInterests = preference.mainInterests?.map((i) => i.mainInterest) ?? [];
    res.budgetLevel = preference.budgets?.[0]?.budgetLevel;
    return res;
  }
}
