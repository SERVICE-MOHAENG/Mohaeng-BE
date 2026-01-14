import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/Notification.entity';
import { NotificationRepository } from './persistence/NotificationRepository';
import { NotificationService } from './service/NotificationService';

/**
 * Notification Module
 * @description
 * - 알림 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationRepository, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
