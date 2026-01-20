import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { FoodPersonality } from './FoodPersonality.enum';

/**
 * UserPreferenceFoodPersonality Entity
 * @description
 * - 사용자 식도락 성향 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_food_personality')
export class UserPreferenceFoodPersonality extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.foodPersonalities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'varchar', length: 36, name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: FoodPersonality,
    name: 'food_personality',
    nullable: false,
  })
  foodPersonality: FoodPersonality;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    foodPersonality: FoodPersonality,
  ): UserPreferenceFoodPersonality {
    const entity = new UserPreferenceFoodPersonality();
    entity.userPreferenceId = userPreferenceId;
    entity.foodPersonality = foodPersonality;
    return entity;
  }
}
