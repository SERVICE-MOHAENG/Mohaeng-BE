import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { BudgetLevel } from '../../preference/entity/BudgetLevel.enum';

/**
 * RegionBudget Entity
 * @description
 * - 지역별 예산 수준 태그를 저장하는 테이블
 * - Region과 1:N 관계 (하나의 Region은 여러 BudgetLevel을 가질 수 있음)
 * - BudgetLevel은 Enum 타입 컬럼(region_budget)에 저장됨
 * - 설문 예산 규모와 매칭
 */
@Entity('region_budget_table')
@Unique(['region', 'budgetLevel'])
export class RegionBudget extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.budgets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'enum',
    enum: BudgetLevel,
    name: 'region_budget',
    nullable: false,
    comment: '예산 수준',
  })
  budgetLevel: BudgetLevel;

  /**
   * 지역 예산 수준 생성 팩토리 메서드
   */
  static create(
    region: Region,
    budgetLevel: BudgetLevel,
  ): RegionBudget {
    const entity = new RegionBudget();
    entity.region = region;
    entity.budgetLevel = budgetLevel;
    return entity;
  }
}
