import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { TravelStyle } from '../../preference/entity/TravelStyle.enum';

/**
 * RegionTravelStyle Entity
 * @description
 * - 지역별 여행 스타일 태그를 저장하는 테이블
 * - Region과 1:N 관계 (하나의 Region은 여러 TravelStyle을 가질 수 있음)
 * - TravelStyle은 Enum 값으로 저장됨
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
    type: 'enum',
    enum: TravelStyle,
    name: 'travel_style',
    nullable: false,
    comment: '여행 스타일',
  })
  travelStyle: TravelStyle;

  /**
   * 지역 여행 스타일 생성 팩토리 메서드
   */
  static create(
    region: Region,
    travelStyle: TravelStyle,
  ): RegionTravelStyle {
    const regionTravelStyle = new RegionTravelStyle();
    regionTravelStyle.region = region;
    regionTravelStyle.travelStyle = travelStyle;
    return regionTravelStyle;
  }
}
