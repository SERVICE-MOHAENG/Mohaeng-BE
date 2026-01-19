import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { TravelStyle } from '../../preference/entity/TravelStyle.enum';

/**
 * RegionTravelStyle Entity
 * @description
 * - 지역의 여행 스타일 태그 중간 테이블
 * - Region과 TravelStyle의 Many-to-Many 관계 매핑
 */
@Entity('region_travel_style_table')
@Unique(['region', 'travelStyle'])
export class RegionTravelStyle extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.travelStyles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'travel_style',
    nullable: false,
    comment: '여행 스타일',
  })
  travelStyle: TravelStyle;

  @Column({
    type: 'int',
    name: 'style_score',
    nullable: false,
    default: 50,
    comment: '해당 스타일의 적합도 점수 (0-100)',
  })
  styleScore: number;

  /**
   * 지역 여행 스타일 생성 팩토리 메서드
   */
  static create(
    region: Region,
    travelStyle: TravelStyle,
    styleScore: number = 50,
  ): RegionTravelStyle {
    const regionTravelStyle = new RegionTravelStyle();
    regionTravelStyle.region = region;
    regionTravelStyle.travelStyle = travelStyle;
    regionTravelStyle.styleScore = Math.min(100, Math.max(0, styleScore));
    return regionTravelStyle;
  }
}
