import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { RoadmapSurvey } from './RoadmapSurvey.entity';
import { TravelTheme } from './TravelTheme.enum';

/**
 * RoadmapSurveyTheme Entity
 * @description
 * - 로드맵 설문 여행 테마 매핑 테이블
 * - RoadmapSurvey와 N:1 관계
 */
@Entity('roadmap_survey_theme_table')
@Unique(['survey', 'theme'])
export class RoadmapSurveyTheme extends BaseEntity {
  @ManyToOne(() => RoadmapSurvey, (survey) => survey.themes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'uuid', name: 'survey_id' })
  surveyId: string;

  @Column({
    type: 'enum',
    enum: TravelTheme,
    name: 'theme',
    nullable: false,
    comment: '여행 테마',
  })
  theme: TravelTheme;

  /**
   * 팩토리 메서드
   */
  static create(surveyId: string, theme: TravelTheme): RoadmapSurveyTheme {
    const entity = new RoadmapSurveyTheme();
    entity.surveyId = surveyId;
    entity.theme = theme;
    return entity;
  }
}
