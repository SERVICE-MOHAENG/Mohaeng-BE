import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSurvey } from './CourseSurvey.entity';
import { TravelTheme } from './TravelTheme.enum';

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

  @Column({
    type: 'enum',
    enum: TravelTheme,
    name: 'theme_type',
    nullable: false,
    comment: '여행 테마',
  })
  theme: TravelTheme;
}
