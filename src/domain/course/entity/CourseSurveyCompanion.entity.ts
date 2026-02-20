import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSurvey } from './CourseSurvey.entity';
import { Companion } from './Companion.enum';

/**
 * CourseSurveyCompanion Entity
 * @description
 * - 설문 동행자 정보
 */
@Entity('course_survey_companion')
export class CourseSurveyCompanion {
  @PrimaryGeneratedColumn('uuid', { name: 'companion_id' })
  id: string;

  @ManyToOne(() => CourseSurvey, (survey) => survey.companions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survay_id' })
  survey: CourseSurvey;

  @Column({ type: 'uuid', name: 'course_survay_id' })
  surveyId: string;

  @Column({
    type: 'enum',
    enum: Companion,
    name: 'companion_type',
    nullable: false,
    comment: '동행자 유형',
  })
  companion: Companion;
}
