import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { RoadmapSurvey } from './RoadmapSurvey.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * RoadmapSurveyDestination Entity
 * @description
 * - 로드맵 설문 목적지 매핑 테이블
 * - RoadmapSurvey와 Region의 N:M 관계
 * - 도시별 여행 날짜 포함
 */
@Entity('roadmap_survey_destination_table')
@Unique(['survey', 'region'])
export class RoadmapSurveyDestination extends BaseEntity {
  @ManyToOne(() => RoadmapSurvey, (survey) => survey.destinations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'varchar', length: 36, name: 'survey_id' })
  surveyId: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'varchar', length: 36, name: 'region_id' })
  regionId: string;

  @Column({
    type: 'date',
    name: 'start_date',
    nullable: false,
    comment: '해당 도시 여행 시작일',
  })
  startDate: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: false,
    comment: '해당 도시 여행 종료일',
  })
  endDate: Date;

  /**
   * 팩토리 메서드
   */
  static create(
    surveyId: string,
    regionId: string,
    startDate: Date,
    endDate: Date,
  ): RoadmapSurveyDestination {
    const destination = new RoadmapSurveyDestination();
    destination.surveyId = surveyId;
    destination.regionId = regionId;
    destination.startDate = startDate;
    destination.endDate = endDate;
    return destination;
  }
}
