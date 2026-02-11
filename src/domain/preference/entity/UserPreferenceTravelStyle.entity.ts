import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { TravelStyle } from './TravelStyle.enum';

/**
 * UserPreferenceTravelStyle Entity
 * @description
 * - 사용자 선호 여행 스타일 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_travel_style')
export class UserPreferenceTravelStyle extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.travelStyles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'uuid', name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: TravelStyle,
    name: 'travel_style',
    nullable: false,
  })
  travelStyle: TravelStyle;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    travelStyle: TravelStyle,
  ): UserPreferenceTravelStyle {
    const entity = new UserPreferenceTravelStyle();
    entity.userPreferenceId = userPreferenceId;
    entity.travelStyle = travelStyle;
    return entity;
  }
}
