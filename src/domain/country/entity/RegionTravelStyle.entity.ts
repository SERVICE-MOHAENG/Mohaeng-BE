import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { TravelStyle } from '../../preference/entity/TravelStyle.enum';

/**
 * RegionTravelStyle Entity
 * @description
 * - 지역별 여행 스타일 적합도 점수를 저장하는 테이블
 * - Region과 1:N 관계 (하나의 Region은 여러 TravelStyle 점수를 가질 수 있음)
 * - TravelStyle은 Enum 값으로 varchar 컬럼에 저장됨
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
