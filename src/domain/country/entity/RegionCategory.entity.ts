import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { PreferredCategory } from '../../preference/entity/PreferredCategory.enum';

/**
 * RegionCategory Entity
 * @description
 * - 지역의 카테고리 태그 중간 테이블
 * - Region과 PreferredCategory의 Many-to-Many 관계 매핑
 */
@Entity('region_category_table')
@Unique(['region', 'category'])
export class RegionCategory extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'category',
    nullable: false,
    comment: '카테고리',
  })
  category: PreferredCategory;

  /**
   * 지역 카테고리 생성 팩토리 메서드
   */
  static create(
    region: Region,
    category: PreferredCategory,
  ): RegionCategory {
    const regionCategory = new RegionCategory();
    regionCategory.region = region;
    regionCategory.category = category;
    return regionCategory;
  }
}
