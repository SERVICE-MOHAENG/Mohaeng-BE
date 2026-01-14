import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entity/Notification.entity';

/**
 * Notification Repository
 * @description
 * - 알림 정보 데이터 접근 계층
 */
@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Notification[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Notification[], number]> {
    const maxLimit = Math.min(limit, 100);
    return this.repository.findAndCount({
      where: { user: { id: userId }, isRead: false },
      skip: (page - 1) * maxLimit,
      take: maxLimit,
      order: { createdAt: 'DESC' },
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async save(notification: Notification): Promise<Notification> {
    return this.repository.save(notification);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
