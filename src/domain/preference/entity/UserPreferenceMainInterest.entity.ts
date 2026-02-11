import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { MainInterest } from './MainInterest.enum';

/**
 * UserPreferenceMainInterest Entity
 * @description
 * - 사용자 핵심 관심사 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_main_interest')
export class UserPreferenceMainInterest extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.mainInterests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'uuid', name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: MainInterest,
    name: 'main_interest',
    nullable: false,
  })
  mainInterest: MainInterest;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    mainInterest: MainInterest,
  ): UserPreferenceMainInterest {
    const entity = new UserPreferenceMainInterest();
    entity.userPreferenceId = userPreferenceId;
    entity.mainInterest = mainInterest;
    return entity;
  }
}
