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

  @Column({ type: 'varchar', length: 36, name: 'user_id' })
  userId: string;

  @OneToOne(() => TravelCourse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse | null;

  @Column({ type: 'varchar', length: 36, name: 'travel_course_id', nullable: true, unique: true })
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

  // 스타일 양자택일 5개 (true: 왼쪽 선택, false: 오른쪽 선택)
  @Column({
    type: 'boolean',
    name: 'is_dense',
    nullable: false,
    comment: '일정 스타일: true=빡빡하게, false=널널하게',
  })
  isDense: boolean;

  @Column({
    type: 'boolean',
    name: 'is_planned',
    nullable: false,
    comment: '계획 스타일: true=계획형, false=즉흥형',
  })
  isPlanned: boolean;

  @Column({
    type: 'boolean',
    name: 'is_tourist_spots',
    nullable: false,
    comment: '목적지 스타일: true=관광지 위주, false=로컬 위주',
  })
  isTouristSpots: boolean;

  @Column({
    type: 'boolean',
    name: 'is_active',
    nullable: false,
    comment: '활동 스타일: true=활동 중심, false=휴식 중심',
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    name: 'is_efficiency',
    nullable: false,
    comment: '우선순위 스타일: true=효율 우선, false=감성 우선',
  })
  isEfficiency: boolean;

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
    isDense: boolean,
    isPlanned: boolean,
    isTouristSpots: boolean,
    isActive: boolean,
    isEfficiency: boolean,
    userNote?: string,
  ): RoadmapSurvey {
    const survey = new RoadmapSurvey();
    survey.userId = userId;
    survey.paxCount = paxCount;
    survey.budget = budget;
    survey.isDense = isDense;
    survey.isPlanned = isPlanned;
    survey.isTouristSpots = isTouristSpots;
    survey.isActive = isActive;
    survey.isEfficiency = isEfficiency;
    survey.userNote = userNote || null;
    survey.travelCourseId = null;
    survey.destinations = [];
    survey.companions = [];
    survey.themes = [];
    return survey;
  }
}
