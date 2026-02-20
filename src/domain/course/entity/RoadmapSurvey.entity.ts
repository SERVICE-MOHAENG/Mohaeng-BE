import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { TravelCourse } from './TravelCourse.entity';
import { RoadmapSurveyDestination } from './RoadmapSurveyDestination.entity';
import { RoadmapSurveyCompanion } from './RoadmapSurveyCompanion.entity';
import { RoadmapSurveyTheme } from './RoadmapSurveyTheme.entity';
import { SurveyBudget } from './SurveyBudget.enum';
import { PacePreference } from './PacePreference.enum';
import { PlanningPreference } from './PlanningPreference.enum';
import { DestinationPreference } from './DestinationPreference.enum';
import { ActivityPreference } from './ActivityPreference.enum';
import { PriorityPreference } from './PriorityPreference.enum';

/**
 * RoadmapSurvey Entity
 * @description
 * - 로드맵 생성 설문 응답 엔티티
 * - User와 N:1 관계 (한 유저가 여러 설문 가능)
 * - TravelCourse와 1:1 관계
 */
@Entity('roadmap_survey_table')
export class RoadmapSurvey extends BaseEntity {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => TravelCourse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse | null;

  @Column({ type: 'uuid', name: 'travel_course_id', nullable: true, unique: true })
  travelCourseId: string | null;

  @Column({
    type: 'int',
    name: 'pax_count',
    nullable: false,
    comment: '인원수',
  })
  paxCount: number;

  @Column({
    type: 'enum',
    enum: SurveyBudget,
    name: 'budget',
    nullable: false,
    comment: '예산 범위',
  })
  budget: SurveyBudget;

  @Column({
    type: 'text',
    name: 'user_note',
    nullable: true,
    comment: '사용자 자연어 요구사항',
  })
  userNote: string | null;

  @Column({
    type: 'enum',
    enum: PacePreference,
    name: 'pace_preference',
    nullable: false,
    comment: '일정 밀도 선호: DENSE=빡빡하게, RELAXED=널널하게',
  })
  pacePreference: PacePreference;

  @Column({
    type: 'enum',
    enum: PlanningPreference,
    name: 'planning_preference',
    nullable: false,
    comment: '계획 성향: PLANNED=계획형, SPONTANEOUS=즉흥형',
  })
  planningPreference: PlanningPreference;

  @Column({
    type: 'enum',
    enum: DestinationPreference,
    name: 'destination_preference',
    nullable: false,
    comment: '여행지 선호: TOURIST_SPOTS=관광지 위주, LOCAL_EXPERIENCE=로컬 위주',
  })
  destinationPreference: DestinationPreference;

  @Column({
    type: 'enum',
    enum: ActivityPreference,
    name: 'activity_preference',
    nullable: false,
    comment: '활동 선호: ACTIVE=활동 중심, REST_FOCUSED=휴식 중심',
  })
  activityPreference: ActivityPreference;

  @Column({
    type: 'enum',
    enum: PriorityPreference,
    name: 'priority_preference',
    nullable: false,
    comment: '우선 가치: EFFICIENCY=효율 우선, EMOTIONAL=감성 우선',
  })
  priorityPreference: PriorityPreference;

  @OneToMany(() => RoadmapSurveyDestination, (destination) => destination.survey, {
    cascade: true,
  })
  destinations: RoadmapSurveyDestination[];

  @OneToMany(() => RoadmapSurveyCompanion, (companion) => companion.survey, {
    cascade: true,
  })
  companions: RoadmapSurveyCompanion[];

  @OneToMany(() => RoadmapSurveyTheme, (theme) => theme.survey, {
    cascade: true,
  })
  themes: RoadmapSurveyTheme[];

  /**
   * 팩토리 메서드
   */
  static create(
    userId: string,
    paxCount: number,
    budget: SurveyBudget,
    pacePreference: PacePreference,
    planningPreference: PlanningPreference,
    destinationPreference: DestinationPreference,
    activityPreference: ActivityPreference,
    priorityPreference: PriorityPreference,
    userNote?: string,
  ): RoadmapSurvey {
    const survey = new RoadmapSurvey();
    survey.userId = userId;
    survey.paxCount = paxCount;
    survey.budget = budget;
    survey.pacePreference = pacePreference;
    survey.planningPreference = planningPreference;
    survey.destinationPreference = destinationPreference;
    survey.activityPreference = activityPreference;
    survey.priorityPreference = priorityPreference;
    survey.userNote = userNote || null;
    survey.travelCourseId = null;
    survey.destinations = [];
    survey.companions = [];
    survey.themes = [];
    return survey;
  }
}
