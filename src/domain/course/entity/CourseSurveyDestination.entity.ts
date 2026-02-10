import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSurvey } from './CourseSurvey.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * CourseSurveyDestination Entity
 * @description
 * - 설문 목적지 및 기간 정보
 */
@Entity('course_survey_destination')
export class CourseSurveyDestination {
  @PrimaryGeneratedColumn('uuid', { name: 'destination_id' })
  id: string;

  @ManyToOne(() => CourseSurvey, (survey) => survey.destinations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survey_id' })
  survey: CourseSurvey;

  @Column({ type: 'varchar', length: 36, name: 'course_survey_id' })
  surveyId: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'varchar', length: 36, name: 'region_id' })
  regionId: string;

  @Column({ type: 'varchar', length: 100, name: 'region_name', nullable: false })
  regionName: string;

  @Column({ type: 'date', name: 'start_day', nullable: false })
  startDay: Date;

  @Column({ type: 'date', name: 'end_date', nullable: false })
  endDate: Date;
}
