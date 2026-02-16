import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { CourseSurvey } from '../../course/entity/CourseSurvey.entity';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { ItineraryStatus } from './ItineraryStatus.enum';

/**
 * ItineraryJobType Enum
 * @description
 * - 작업 유형 구분
 * - GENERATION: 새로운 로드맵 생성
 * - MODIFICATION: 기존 로드맵 수정
 */
export enum ItineraryJobType {
  GENERATION = 'GENERATION',
  MODIFICATION = 'MODIFICATION',
}

/**
 * IntentStatus Enum
 * @description
 * - 수정 요청의 의도 분류 결과 (MODIFICATION 전용)
 * - SUCCESS: 수정 완료
 * - ASK_CLARIFICATION: 명확화 요청
 * - GENERAL_CHAT: 일반 대화
 * - REJECTED: 거부
 */
export enum IntentStatus {
  SUCCESS = 'SUCCESS',
  ASK_CLARIFICATION = 'ASK_CLARIFICATION',
  GENERAL_CHAT = 'GENERAL_CHAT',
  REJECTED = 'REJECTED',
}

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

  @Column({
    type: 'enum',
    enum: ItineraryJobType,
    name: 'job_type',
    nullable: false,
    default: ItineraryJobType.GENERATION,
    comment: '작업 유형: GENERATION, MODIFICATION',
  })
  jobType: ItineraryJobType;

  @Column({
    type: 'enum',
    enum: IntentStatus,
    name: 'intent_status',
    nullable: true,
    comment: 'Intent 분류 결과 (MODIFICATION 전용)',
  })
  intentStatus: IntentStatus | null;

  @Column({
    type: 'json',
    name: 'diff_keys',
    nullable: true,
    comment: '변경된 노드 ID 목록 (MODIFICATION 전용)',
  })
  diffKeys: string[] | null;

  @Column({
    type: 'text',
    name: 'user_query',
    nullable: true,
    comment: '사용자 수정 요청 메시지 (MODIFICATION 전용)',
  })
  userQuery: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => CourseSurvey, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey: CourseSurvey | null;

  @Column({ type: 'uuid', name: 'survey_id', nullable: true })
  surveyId: string | null;

  @ManyToOne(() => TravelCourse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse | null;

  @Column({
    type: 'uuid',
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
   * 팩토리 메서드 (생성용)
   */
  static create(userId: string, surveyId: string): ItineraryJob {
    const job = new ItineraryJob();
    job.userId = userId;
    job.surveyId = surveyId;
    job.status = ItineraryStatus.PENDING;
    job.jobType = ItineraryJobType.GENERATION;
    job.intentStatus = null;
    job.diffKeys = null;
    job.userQuery = null;
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

  /**
   * 수정 작업용 팩토리 메서드
   */
  static createModificationJob(
    userId: string,
    travelCourseId: string,
    userQuery: string,
  ): ItineraryJob {
    const job = new ItineraryJob();
    job.userId = userId;
    job.surveyId = null; // 수정 작업은 survey와 무관
    job.travelCourseId = travelCourseId;
    job.status = ItineraryStatus.PENDING;
    job.jobType = ItineraryJobType.MODIFICATION;
    job.intentStatus = null;
    job.diffKeys = null;
    job.userQuery = userQuery;
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
   * Intent 포함 성공 처리 (수정 작업 전용)
   */
  markSuccessWithIntent(
    intentStatus: IntentStatus,
    llmCommentary?: string,
    diffKeys?: string[],
  ): void {
    this.status = ItineraryStatus.SUCCESS;
    this.intentStatus = intentStatus;
    this.llmCommentary = llmCommentary ?? null;
    this.diffKeys = diffKeys ?? null;
    this.completedAt = new Date();
  }
}
