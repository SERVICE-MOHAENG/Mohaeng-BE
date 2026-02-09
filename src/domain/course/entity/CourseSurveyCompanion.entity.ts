import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { RoadmapSurvey } from './RoadmapSurvey.entity';

/**
 * CourseSurveyCompanion Entity
 * @description
 * - 설문 동행자 정보
 */
@Entity('course_survey_companion')
export class CourseSurveyCompanion {
  @PrimaryGeneratedColumn('uuid', { name: 'companion_id' })
  id: string;

  @ManyToOne(() => RoadmapSurvey, (survey) => survey.companions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survay_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'varchar', length: 36, name: 'course_survay_id' })
  surveyId: string;

  @Column({ type: 'varchar', length: 50, name: 'companion_type', nullable: false })
  companion: string;
}
