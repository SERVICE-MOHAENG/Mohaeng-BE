import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { WeatherPreference } from './WeatherPreference.enum';

/**
 * UserPreferenceWeather Entity
 * @description
 * - 사용자 날씨/계절 선호도 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_weather')
export class UserPreferenceWeather extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.weatherPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'uuid', name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: WeatherPreference,
    name: 'weather',
    nullable: false,
  })
  weather: WeatherPreference;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    weather: WeatherPreference,
  ): UserPreferenceWeather {
    const entity = new UserPreferenceWeather();
    entity.userPreferenceId = userPreferenceId;
    entity.weather = weather;
    return entity;
  }
}
