import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { ItineraryStatus } from './ItineraryStatus.enum';

/**
 * ItineraryJob Entity
 * @description
 * - 여행 일정 생성 작업 엔티티
 * - 비동기 LLM 생성 작업의 라이프사이클 추적
 * - CourseSurvey(입력) ↔ TravelCourse(출력) 브릿지
 */
@Entity('itinerary_job_table')
export class ItineraryJob extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ItineraryStatus,
    name: 'status',
    nullable: false,
    default: ItineraryStatus.PENDING,
    comment: '작업 상태: PENDING, PROCESSING, SUCCESS, FAILED',
  })
  status: ItineraryStatus;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => CourseSurvey, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey: CourseSurvey;

  @Column({ type: 'uuid', name: 'survey_id', unique: true })
  surveyId: string;

  @OneToOne(() => TravelCourse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse | null;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'travel_course_id',
    nullable: true,
  })
  travelCourseId: string | null;

  @Column({
    type: 'int',
    name: 'attempt_count',
    nullable: false,
    default: 0,
    comment: '시도 횟수',
  })
  attemptCount: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'error_code',
    nullable: true,
    comment: '에러 코드',
  })
  errorCode: string | null;

  @Column({
    type: 'text',
    name: 'error_message',
    nullable: true,
    comment: '에러 메시지',
  })
  errorMessage: string | null;

  @Column({
    type: 'text',
    name: 'llm_commentary',
    nullable: true,
    comment: 'LLM이 생성한 코멘터리 (코스 선정 이유)',
  })
  llmCommentary: string | null;

  @Column({
    type: 'json',
    name: 'next_action_suggestions',
    nullable: true,
    comment: 'LLM이 제안하는 다음 행동 목록',
  })
  nextActionSuggestions: string[] | null;

  @Column({
    type: 'timestamp',
    name: 'started_at',
    nullable: true,
    comment: '처리 시작 시각',
  })
  startedAt: Date | null;

  @Column({
    type: 'timestamp',
    name: 'completed_at',
    nullable: true,
    comment: '완료 시각',
  })
  completedAt: Date | null;

  /**
   * 팩토리 메서드
   */
  static create(userId: string, surveyId: string): ItineraryJob {
    const job = new ItineraryJob();
    job.userId = userId;
    job.surveyId = surveyId;
    job.status = ItineraryStatus.PENDING;
    job.travelCourseId = null;
    job.attemptCount = 0;
    job.errorCode = null;
    job.errorMessage = null;
    job.llmCommentary = null;
    job.nextActionSuggestions = null;
    job.startedAt = null;
    job.completedAt = null;
    return job;
  }

  /**
   * 처리 시작 상태로 변경
   */
  markProcessing(): void {
    this.status = ItineraryStatus.PROCESSING;
    this.startedAt = new Date();
  }

  /**
   * 성공 상태로 변경
   */
  markSuccess(
    travelCourseId: string,
    llmCommentary?: string,
    nextActionSuggestions?: string[],
  ): void {
    this.status = ItineraryStatus.SUCCESS;
    this.travelCourseId = travelCourseId;
    this.llmCommentary = llmCommentary ?? null;
    this.nextActionSuggestions = nextActionSuggestions ?? null;
    this.completedAt = new Date();
  }

  /**
   * 실패 상태로 변경
   */
  markFailed(errorCode: string, errorMessage: string): void {
    this.status = ItineraryStatus.FAILED;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }

  /**
   * 시도 횟수 증가
   */
  incrementAttempt(): void {
    this.attemptCount += 1;
  }

  /**
   * Stale 상태 여부 확인
   */
  isStale(timeoutMinutes: number): boolean {
    if (this.status !== ItineraryStatus.PROCESSING || !this.startedAt) {
      return false;
    }
    const elapsed = Date.now() - this.startedAt.getTime();
    return elapsed > timeoutMinutes * 60 * 1000;
  }
}
