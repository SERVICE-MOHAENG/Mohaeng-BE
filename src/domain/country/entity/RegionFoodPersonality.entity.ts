import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { FoodPersonality } from '../../preference/entity/FoodPersonality.enum';

/**
 * RegionFoodPersonality Entity
 * @description
 * - 지역의 식도락 성향 태그 중간 테이블
 * - Region과 FoodPersonality의 N:M 관계 매핑
 * - 설문 5번: 식도락 성향과 매칭
 */
@Entity('region_food_personality_table')
@Unique(['region', 'foodPersonality'])
export class RegionFoodPersonality extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.foodPersonalities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'food_personality',
    nullable: false,
    comment: '식도락 성향',
  })
  foodPersonality: FoodPersonality;

  /**
   * 지역 식도락 성향 생성 팩토리 메서드
   */
  static create(
    region: Region,
    foodPersonality: FoodPersonality,
  ): RegionFoodPersonality {
    const entity = new RegionFoodPersonality();
    entity.region = region;
    entity.foodPersonality = foodPersonality;
    return entity;
  }
}
