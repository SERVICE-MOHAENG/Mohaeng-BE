import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { Environment } from '../../preference/entity/Environment.enum';

/**
 * RegionEnvironment Entity
 * @description
 * - 지역별 환경 태그를 저장하는 테이블
 * - Region과 1:N 관계 (하나의 Region은 여러 Environment를 가질 수 있음)
 * - Environment는 Enum 값으로 varchar 컬럼에 저장됨
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
