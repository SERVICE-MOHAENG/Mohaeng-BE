import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { BudgetLevel } from './BudgetLevel.enum';

/**
 * UserPreferenceBudget Entity
 * @description
 * - 사용자 예산 수준 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_budget')
export class UserPreferenceBudget extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.budgets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'uuid', name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: BudgetLevel,
    name: 'budget_level',
    nullable: false,
  })
  budgetLevel: BudgetLevel;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    budgetLevel: BudgetLevel,
  ): UserPreferenceBudget {
    const entity = new UserPreferenceBudget();
    entity.userPreferenceId = userPreferenceId;
    entity.budgetLevel = budgetLevel;
    return entity;
  }
}
