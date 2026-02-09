import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { RoadmapSurvey } from './RoadmapSurvey.entity';

/**
 * CourseSurveyTheme Entity
 * @description
 * - 설문 여행 테마 정보
 */
@Entity('course_survey_theme')
export class CourseSurveyTheme {
  @PrimaryGeneratedColumn('uuid', { name: 'theme_id' })
  id: string;

  @ManyToOne(() => RoadmapSurvey, (survey) => survey.themes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survay_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'varchar', length: 36, name: 'course_survay_id' })
  surveyId: string;

  @Column({ type: 'varchar', length: 50, name: 'theme_type', nullable: false })
  theme: string;
}
