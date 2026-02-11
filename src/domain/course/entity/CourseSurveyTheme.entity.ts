import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSurvey } from './CourseSurvey.entity';

/**
 * CourseSurveyTheme Entity
 * @description
 * - 설문 여행 테마 정보
 */
@Entity('course_survey_theme')
export class CourseSurveyTheme {
  @PrimaryGeneratedColumn('uuid', { name: 'theme_id' })
  id: string;

  @ManyToOne(() => CourseSurvey, (survey) => survey.themes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survay_id' })
  survey: CourseSurvey;

  @Column({ type: 'uuid', name: 'course_survay_id' })
  surveyId: string;

  @Column({ type: 'varchar', length: 50, name: 'theme_type', nullable: false })
  theme: string;
}
