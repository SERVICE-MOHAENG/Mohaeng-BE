import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';

/**
 * Notification Type Enum
 */
export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  SYSTEM = 'SYSTEM',
}

/**
 * Notification Entity
 * @description
 * - 알림 정보 엔티티
 * - 사용자에게 전달되는 알림 관리
 */
@Entity('notification_table')
export class Notification extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 200,
    name: 'notification_title',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    name: 'notification_content',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    name: 'notification_type',
    nullable: false,
  })
  type: NotificationType;

  @Column({
    type: 'boolean',
    name: 'is_read',
    nullable: false,
    default: false,
    comment: '읽음 여부',
  })
  isRead: boolean;

  @Column({
    type: 'uuid',
    name: 'reference_id',
    nullable: true,
    comment: '참조 ID (블로그 ID, 코스 ID 등)',
  })
  referenceId: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;

  /**
   * 알림 생성 팩토리 메서드
   */
  static create(
    title: string,
    content: string,
    type: NotificationType,
    user: User,
    sender?: User,
    referenceId?: string,
  ): Notification {
    const notification = new Notification();
    notification.title = title;
    notification.content = content;
    notification.type = type;
    notification.user = user;
    notification.sender = sender || null;
    notification.referenceId = referenceId || null;
    notification.isRead = false;
    return notification;
  }

  /**
   * 알림 읽음 처리
   */
  markAsRead(): void {
    this.isRead = true;
  }
}
