import { Module } from '@nestjs/common';
import { LoggerModule } from '../../global/logger/Logger.module';
import { FeedbackController } from './presentation/FeedbackController';
import { FeedbackService } from './service/FeedbackService';

/**
 * Feedback Module
 * @description
 * - 사용자 피드백 접수 및 Discord 웹훅 전송
 */
@Module({
  imports: [LoggerModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
