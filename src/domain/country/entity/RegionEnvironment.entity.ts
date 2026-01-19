import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { Environment } from '../../preference/entity/Environment.enum';

/**
 * RegionEnvironment Entity
 * @description
 * - 지역의 환경 태그 중간 테이블
 * - Region과 Environment의 N:M 관계 매핑
 * - 설문 3번: 선호 환경과 매칭
 */
@Entity('region_environment_table')
@Unique(['region', 'environment'])
export class RegionEnvironment extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.environments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'environment',
    nullable: false,
    comment: '환경 유형',
  })
  environment: Environment;

  /**
   * 지역 환경 생성 팩토리 메서드
   */
  static create(region: Region, environment: Environment): RegionEnvironment {
    const regionEnvironment = new RegionEnvironment();
    regionEnvironment.region = region;
    regionEnvironment.environment = environment;
    return regionEnvironment;
  }
}
