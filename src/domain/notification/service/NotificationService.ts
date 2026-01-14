import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../persistence/NotificationRepository';
import { Notification, NotificationType } from '../entity/Notification.entity';
import { NotificationNotFoundException } from '../exception/NotificationNotFoundException';
import { User } from '../../user/entity/User.entity';

/**
 * Notification Service
 * @description
 * - 알림 도메인 비즈니스 로직
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * ID로 알림 조회
   */
  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotificationNotFoundException();
    }
    return notification;
  }

  /**
   * 사용자 ID로 알림 목록 조회
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Notification[], number]> {
    return this.notificationRepository.findByUserId(userId, page, limit);
  }

  /**
   * 사용자의 읽지 않은 알림 조회
   */
  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  /**
   * 사용자의 읽지 않은 알림 개수 조회
   */
  async countUnreadByUserId(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUserId(userId);
  }

  /**
   * 알림 생성
   */
  async create(
    title: string,
    content: string,
    type: NotificationType,
    user: User,
    sender?: User,
    referenceId?: string,
  ): Promise<Notification> {
    const notification = Notification.create(
      title,
      content,
      type,
      user,
      sender,
      referenceId,
    );
    return this.notificationRepository.save(notification);
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findById(id);
    notification.markAsRead();
    return this.notificationRepository.save(notification);
  }

  /**
   * 알림 삭제
   */
  async delete(id: string): Promise<void> {
    const notification = await this.findById(id);
    await this.notificationRepository.delete(notification.id);
  }
}
