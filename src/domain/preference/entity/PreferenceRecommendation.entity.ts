import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { PreferenceJob } from './PreferenceJob.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * PreferenceRecommendation Entity
 * @description
 * - Python LLM이 추천한 여행지 결과 저장
 * - PreferenceJob과 N:1 관계 (최대 5개 저장)
 * - Region과 N:1 관계 (nullable: DB에 없는 지역은 regionId=null)
 */
@Entity('preference_recommendation_table')
export class PreferenceRecommendation extends BaseEntity {
  @ManyToOne(() => PreferenceJob, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: PreferenceJob;

  @Column({ type: 'uuid', name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Region, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'region_id' })
  region: Region | null;

  @Column({ type: 'uuid', name: 'region_id', nullable: true, comment: 'Region FK (DB에 없으면 null)' })
  regionId: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'region_name',
    nullable: false,
    comment: '추천 여행지명 (Python 서버에서 받은 코드값)',
  })
  regionName: string;

  static create(
    jobId: string,
    regionName: string,
    regionId?: string,
  ): PreferenceRecommendation {
    const entity = new PreferenceRecommendation();
    entity.jobId = jobId;
    entity.regionName = regionName;
    entity.regionId = regionId ?? null;
    return entity;
  }
}
