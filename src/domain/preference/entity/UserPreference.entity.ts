import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { UserPreferenceWeather } from './UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from './UserPreferenceTravelRange.entity';
import { UserPreferenceEnvironment } from './UserPreferenceEnvironment.entity';
import { UserPreferenceFoodPersonality } from './UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from './UserPreferenceMainInterest.entity';
import { UserPreferenceContinent } from './UserPreferenceContinent.entity';
import { UserPreferenceBudget } from './UserPreferenceBudget.entity';

/**
 * UserPreference Entity
 * @description
 * - 사용자 여행 선호도 엔티티
 * - User와 1:1 관계
 * - 각 선호도 항목은 매핑 테이블을 통해 복수 선택 가능
 */
@Entity('user_preference')
export class UserPreference extends BaseEntity {
  @OneToOne(() => User, (user) => user.preference, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 36, name: 'user_id', unique: true })
  userId: string;

  // 1. 날씨/계절 선호도 (복수 선택)
  @OneToMany(() => UserPreferenceWeather, (weather) => weather.preference, {
    cascade: true,
  })
  weatherPreferences: UserPreferenceWeather[];

  // 2. 이동 거리 선호도 (복수 선택)
  @OneToMany(() => UserPreferenceTravelRange, (range) => range.preference, {
    cascade: true,
  })
  travelRanges: UserPreferenceTravelRange[];

  // 3. 선호 환경 (복수 선택)
  @OneToMany(
    () => UserPreferenceEnvironment,
    (environment) => environment.preference,
    { cascade: true },
  )
  environments: UserPreferenceEnvironment[];

  // 4. 식도락 성향 (복수 선택)
  @OneToMany(
    () => UserPreferenceFoodPersonality,
    (food) => food.preference,
    { cascade: true },
  )
  foodPersonalities: UserPreferenceFoodPersonality[];

  // 5. 핵심 관심사 (복수 선택)
  @OneToMany(
    () => UserPreferenceMainInterest,
    (interest) => interest.preference,
    { cascade: true },
  )
  mainInterests: UserPreferenceMainInterest[];

  // 6. 선호 대륙 (복수 선택)
  @OneToMany(() => UserPreferenceContinent, (continent) => continent.preference, {
    cascade: true,
  })
  continents: UserPreferenceContinent[];

  // 7. 예산 수준 (복수 선택)
  @OneToMany(() => UserPreferenceBudget, (budget) => budget.preference, {
    cascade: true,
  })
  budgets: UserPreferenceBudget[];

  /**
   * 팩토리 메서드: 빈 선호도 생성
   */
  static create(userId: string): UserPreference {
    const preference = new UserPreference();
    preference.userId = userId;
    preference.weatherPreferences = [];
    preference.travelRanges = [];
    preference.environments = [];
    preference.foodPersonalities = [];
    preference.mainInterests = [];
    preference.continents = [];
    preference.budgets = [];
    return preference;
  }
}
