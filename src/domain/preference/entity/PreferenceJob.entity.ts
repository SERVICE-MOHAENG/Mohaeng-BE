import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { UserPreference } from './UserPreference.entity';

/**
 * PreferenceJobStatus Enum
 */
export enum PreferenceJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * PreferenceJob Entity
 * @description
 * - 초기 설문 기반 여행지 추천 비동기 작업 추적 엔티티
 * - BullMQ job 라이프사이클 관리
 */
@Entity('preference_job_table')
export class PreferenceJob extends BaseEntity {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserPreference, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'preference_id' })
  preference: UserPreference;

  @Column({ type: 'uuid', name: 'preference_id' })
  preferenceId: string;

  @Column({
    type: 'enum',
    enum: PreferenceJobStatus,
    name: 'status',
    nullable: false,
    default: PreferenceJobStatus.PENDING,
    comment: '작업 상태',
  })
  status: PreferenceJobStatus;

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
    type: 'int',
    name: 'retry_count',
    nullable: false,
    default: 0,
    comment: 'FAILED 콜백 재시도 횟수 (최대 1회)',
  })
  retryCount: number;

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

  static create(userId: string, preferenceId: string): PreferenceJob {
    const job = new PreferenceJob();
    job.userId = userId;
    job.preferenceId = preferenceId;
    job.status = PreferenceJobStatus.PENDING;
    job.retryCount = 0;
    job.errorCode = null;
    job.errorMessage = null;
    job.startedAt = null;
    job.completedAt = null;
    return job;
  }

  /**
   * PENDING 상태로 리셋 (재시도용)
   */
  resetForRetry(): void {
    this.status = PreferenceJobStatus.PENDING;
    this.retryCount += 1;
    this.errorCode = null;
    this.errorMessage = null;
    this.startedAt = null;
    this.completedAt = null;
  }

  /**
   * Stale 상태 여부 확인
   */
  isStale(timeoutMinutes: number): boolean {
    if (this.status !== PreferenceJobStatus.PROCESSING || !this.startedAt) {
      return false;
    }
    const elapsed = Date.now() - this.startedAt.getTime();
    return elapsed > timeoutMinutes * 60 * 1000;
  }

  markProcessing(): void {
    this.status = PreferenceJobStatus.PROCESSING;
    this.startedAt = new Date();
  }

  markSuccess(): void {
    this.status = PreferenceJobStatus.SUCCESS;
    this.completedAt = new Date();
  }

  markFailed(errorCode: string, errorMessage: string): void {
    this.status = PreferenceJobStatus.FAILED;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }
}
