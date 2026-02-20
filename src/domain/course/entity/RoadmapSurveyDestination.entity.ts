import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { RoadmapSurvey } from './RoadmapSurvey.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * RoadmapSurveyDestination Entity
 * @description
 * - 로드맵 설문 목적지 및 여행 기간 매핑 테이블
 * - RoadmapSurvey와 N:1 관계
 * - Region과 N:1 관계
 */
@Entity('roadmap_survey_destination_table')
export class RoadmapSurveyDestination extends BaseEntity {
  @ManyToOne(() => RoadmapSurvey, (survey) => survey.destinations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'uuid', name: 'survey_id' })
  surveyId: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'uuid', name: 'region_id' })
  regionId: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'region_name',
    nullable: false,
    comment: '지역명 (비정규화 캐싱)',
  })
  regionName: string;

  @Column({
    type: 'date',
    name: 'start_day',
    nullable: false,
    comment: '여행 시작일',
  })
  startDay: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: false,
    comment: '여행 종료일',
  })
  endDate: Date;

  /**
   * 팩토리 메서드
   */
  static create(
    surveyId: string,
    regionId: string,
    regionName: string,
    startDay: Date,
    endDate: Date,
  ): RoadmapSurveyDestination {
    const entity = new RoadmapSurveyDestination();
    entity.surveyId = surveyId;
    entity.regionId = regionId;
    entity.regionName = regionName;
    entity.startDay = startDay;
    entity.endDate = endDate;
    return entity;
  }
}
