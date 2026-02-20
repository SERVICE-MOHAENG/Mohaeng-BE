import { Injectable } from '@nestjs/common';
import { UserPreferenceRepository } from '../persistence/UserPreferenceRepository';
import { UserPreference } from '../entity/UserPreference.entity';
import { UserPreferenceWeather } from '../entity/UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from '../entity/UserPreferenceTravelRange.entity';
import { UserPreferenceTravelStyle } from '../entity/UserPreferenceTravelStyle.entity';
import { UserPreferenceFoodPersonality } from '../entity/UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from '../entity/UserPreferenceMainInterest.entity';
import { UserPreferenceBudget } from '../entity/UserPreferenceBudget.entity';
import { WeatherPreference } from '../entity/WeatherPreference.enum';
import { TravelRange } from '../entity/TravelRange.enum';
import { TravelStyle } from '../entity/TravelStyle.enum';
import { FoodPersonality } from '../entity/FoodPersonality.enum';
import { MainInterest } from '../entity/MainInterest.enum';
import { BudgetLevel } from '../entity/BudgetLevel.enum';

/**
 * 선호도 생성/수정 DTO
 * - weather / travelRange / travelStyle / budget : 단일값
 * - foodPersonalities / mainInterests            : 다중값 배열
 */
export interface CreateUserPreferenceDto {
  userId: string;
  weather: WeatherPreference;
  travelRange: TravelRange;
  travelStyle: TravelStyle;
  foodPersonalities: FoodPersonality[];
  mainInterests: MainInterest[];
  budget: BudgetLevel;
}

/**
 * UserPreferenceService
 * @description
 * - 사용자 선호도 비즈니스 로직
 */
@Injectable()
export class UserPreferenceService {
  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  /**
   * 사용자 선호도 생성 또는 업데이트
   * @description
   * - 이미 선호도가 있으면 기존 것을 삭제하고 새로 생성
   * - cascade 설정으로 매핑 테이블도 자동으로 저장됨
   */
  async createOrUpdate(
    dto: CreateUserPreferenceDto,
  ): Promise<UserPreference> {
    // 기존 선호도가 있으면 삭제
    const existing = await this.userPreferenceRepository.findByUserId(
      dto.userId,
    );
    if (existing) {
      await this.userPreferenceRepository.delete(existing.id);
    }

    // 새 선호도 생성
    const preference = UserPreference.create(dto.userId);

    // 매핑 엔티티들 생성 (아직 preference.id가 없으므로 save 후 설정됨)
    const saved = await this.userPreferenceRepository.save(preference);

    // 각 선호도 매핑 엔티티 생성
    // 단일 선택 4개 → 매핑 테이블에 row 1개씩 저장
    saved.weatherPreferences = [
      UserPreferenceWeather.create(saved.id, dto.weather),
    ];

    saved.travelRanges = [
      UserPreferenceTravelRange.create(saved.id, dto.travelRange),
    ];

    saved.travelStyles = [
      UserPreferenceTravelStyle.create(saved.id, dto.travelStyle),
    ];

    saved.budgets = [
      UserPreferenceBudget.create(saved.id, dto.budget),
    ];

    // 다중 선택 2개 → 배열 그대로 저장
    saved.foodPersonalities = dto.foodPersonalities.map((food) =>
      UserPreferenceFoodPersonality.create(saved.id, food),
    );

    saved.mainInterests = dto.mainInterests.map((interest) =>
      UserPreferenceMainInterest.create(saved.id, interest),
    );

    // cascade로 매핑 테이블도 자동 저장
    return this.userPreferenceRepository.save(saved);
  }

  /**
   * 사용자 ID로 선호도 조회
   */
  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findByUserId(userId);
  }

  /**
   * 선호도 ID로 조회
   */
  async findById(id: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findById(id);
  }

  /**
   * 선호도 존재 여부 확인
   */
  async existsByUserId(userId: string): Promise<boolean> {
    return this.userPreferenceRepository.existsByUserId(userId);
  }

  /**
   * 선호도 삭제
   */
  async delete(id: string): Promise<void> {
    await this.userPreferenceRepository.delete(id);
  }
}
