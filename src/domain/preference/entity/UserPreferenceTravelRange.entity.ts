import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { TravelRange } from './TravelRange.enum';

/**
 * UserPreferenceTravelRange Entity
 * @description
 * - 사용자 이동 거리 선호도 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_travel_range')
export class UserPreferenceTravelRange extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.travelRanges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'varchar', length: 36, name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: TravelRange,
    name: 'travel_range',
    nullable: false,
  })
  travelRange: TravelRange;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    travelRange: TravelRange,
  ): UserPreferenceTravelRange {
    const entity = new UserPreferenceTravelRange();
    entity.userPreferenceId = userPreferenceId;
    entity.travelRange = travelRange;
    return entity;
  }
}
