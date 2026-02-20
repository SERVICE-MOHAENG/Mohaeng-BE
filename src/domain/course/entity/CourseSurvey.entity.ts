import { Entity, Column, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entity/User.entity';
import { TravelCourse } from './TravelCourse.entity';
import { CourseSurveyDestination } from './CourseSurveyDestination.entity';
import { CourseSurveyCompanion } from './CourseSurveyCompanion.entity';
import { CourseSurveyTheme } from './CourseSurveyTheme.entity';
import { SurveyBudget } from './SurveyBudget.enum';
import { PacePreference } from './PacePreference.enum';
import { PlanningPreference } from './PlanningPreference.enum';
import { DestinationPreference } from './DestinationPreference.enum';
import { ActivityPreference } from './ActivityPreference.enum';
import { PriorityPreference } from './PriorityPreference.enum';

/**
 * CourseSurvey Entity
 * @description
 * - 로드맵 설문 정보 (레거시 - course_survey_table)
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

  @Column({
    type: 'enum',
    enum: SurveyBudget,
    name: 'budget',
    nullable: false,
    comment: '예산 범위',
  })
  budget: SurveyBudget;

  @Column({ type: 'text', name: 'user_note', nullable: true })
  userNote: string | null;

  @Column({ type: 'date', name: 'travel_start_day', nullable: true })
  travelStartDay: Date | null;

  @Column({ type: 'date', name: 'travel_end_day', nullable: true })
  travelEndDay: Date | null;

  @Column({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: PacePreference,
    name: 'is_dense',
    nullable: false,
    comment: '일정 밀도 선호: DENSE=빡빡하게, RELAXED=널널하게',
  })
  pacePreference: PacePreference;

  @Column({
    type: 'enum',
    enum: PlanningPreference,
    name: 'is_planned',
    nullable: false,
    comment: '계획 성향: PLANNED=계획형, SPONTANEOUS=즉흥형',
  })
  planningPreference: PlanningPreference;

  @Column({
    type: 'enum',
    enum: DestinationPreference,
    name: 'is_tourist_spots',
    nullable: false,
    comment: '여행지 선호: TOURIST_SPOTS=관광지 위주, LOCAL_EXPERIENCE=로컬 위주',
  })
  destinationPreference: DestinationPreference;

  @Column({
    type: 'enum',
    enum: ActivityPreference,
    name: 'is_activate',
    nullable: false,
    comment: '활동 선호: ACTIVE=활동 중심, REST_FOCUSED=휴식 중심',
  })
  activityPreference: ActivityPreference;

  @Column({
    type: 'enum',
    enum: PriorityPreference,
    name: 'is_efficiency',
    nullable: false,
    comment: '우선 가치: EFFICIENCY=효율 우선, EMOTIONAL=감성 우선',
  })
  priorityPreference: PriorityPreference;

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
