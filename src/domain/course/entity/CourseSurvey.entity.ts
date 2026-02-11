import { Entity, Column, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entity/User.entity';
import { TravelCourse } from './TravelCourse.entity';
import { CourseSurveyDestination } from './CourseSurveyDestination.entity';
import { CourseSurveyCompanion } from './CourseSurveyCompanion.entity';
import { CourseSurveyTheme } from './CourseSurveyTheme.entity';

/**
 * CourseSurvey Entity
 * @description
 * - 로드맵 설문 정보
 */
@Entity('course_survey_table')
export class CourseSurvey {
  @PrimaryGeneratedColumn('uuid', { name: 'course_survay_id' })
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => TravelCourse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse | null;

  @Column({ type: 'uuid', name: 'course_id', nullable: true })
  travelCourseId: string | null;

  @Column({ type: 'int', name: 'pax_count', nullable: false })
  paxCount: number;

  @Column({ type: 'varchar', length: 50, name: 'budget', nullable: false })
  budget: string;

  @Column({ type: 'text', name: 'user_note', nullable: true })
  userNote: string | null;

  @Column({ type: 'date', name: 'travel_start_day', nullable: true })
  travelStartDay: Date | null;

  @Column({ type: 'date', name: 'travel_end_day', nullable: true })
  travelEndDay: Date | null;

  @Column({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, name: 'is_dense', nullable: false })
  pacePreference: string;

  @Column({ type: 'varchar', length: 50, name: 'is_planned', nullable: false })
  planningPreference: string;

  @Column({ type: 'varchar', length: 50, name: 'is_tourist_spots', nullable: false })
  destinationPreference: string;

  @Column({ type: 'varchar', length: 50, name: 'is_activate', nullable: false })
  activityPreference: string;

  @Column({ type: 'varchar', length: 50, name: 'is_efficiency', nullable: false })
  priorityPreference: string;

  @OneToMany(
    () => CourseSurveyDestination,
    (destination) => destination.survey,
    { cascade: true },
  )
  destinations: CourseSurveyDestination[];

  @OneToMany(() => CourseSurveyCompanion, (companion) => companion.survey, {
    cascade: true,
  })
  companions: CourseSurveyCompanion[];

  @OneToMany(() => CourseSurveyTheme, (theme) => theme.survey, {
    cascade: true,
  })
  themes: CourseSurveyTheme[];
}
