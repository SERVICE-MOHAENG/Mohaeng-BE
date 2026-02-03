import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { RoadmapSurvey } from './RoadmapSurvey.entity';
import { Companion } from './Companion.enum';

/**
 * RoadmapSurveyCompanion Entity
 * @description
 * - 로드맵 설문 동행자 매핑 테이블
 * - RoadmapSurvey와 N:1 관계
 */
@Entity('roadmap_survey_companion_table')
@Unique(['survey', 'companion'])
export class RoadmapSurveyCompanion extends BaseEntity {
  @ManyToOne(() => RoadmapSurvey, (survey) => survey.companions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'varchar', length: 36, name: 'survey_id' })
  surveyId: string;

  @Column({
    type: 'enum',
    enum: Companion,
    name: 'companion',
    nullable: false,
    comment: '동행자 유형',
  })
  companion: Companion;

  /**
   * 팩토리 메서드
   */
  static create(surveyId: string, companion: Companion): RoadmapSurveyCompanion {
    const entity = new RoadmapSurveyCompanion();
    entity.surveyId = surveyId;
    entity.companion = companion;
    return entity;
  }
}
