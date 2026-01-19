import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { MainInterest } from '../../preference/entity/MainInterest.enum';

/**
 * RegionMainInterest Entity
 * @description
 * - 지역의 핵심 관심사 태그 중간 테이블
 * - Region과 MainInterest의 N:M 관계 매핑
 * - 설문 6번: 핵심 관심사와 매칭
 */
@Entity('region_main_interest_table')
@Unique(['region', 'mainInterest'])
export class RegionMainInterest extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.mainInterests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'main_interest',
    nullable: false,
    comment: '핵심 관심사',
  })
  mainInterest: MainInterest;

  /**
   * 지역 핵심 관심사 생성 팩토리 메서드
   */
  static create(
    region: Region,
    mainInterest: MainInterest,
  ): RegionMainInterest {
    const entity = new RegionMainInterest();
    entity.region = region;
    entity.mainInterest = mainInterest;
    return entity;
  }
}
