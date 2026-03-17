import { Injectable } from '@nestjs/common';
import { GlobalExternalServiceErrorException } from '../../../global/exception/GlobalExternalServiceErrorException';
import { DiscordService } from '../../../global/logger/DiscordService';
import { CreateFeedbackRequest } from '../presentation/dto/request/CreateFeedbackRequest';
import { SubmitFeedbackResponse } from '../presentation/dto/response/SubmitFeedbackResponse';

export interface FeedbackUser {
  id: string;
  email: string;
}

/**
 * Feedback Service
 * @description
 * - 사용자 피드백을 Discord 웹훅으로 전달
 */
@Injectable()
export class FeedbackService {
  constructor(private readonly discordService: DiscordService) {}

  async submitFeedback(
    user: FeedbackUser,
    request: CreateFeedbackRequest,
  ): Promise<SubmitFeedbackResponse> {
    try {
      await this.discordService.sendFeedback({
        title: request.title.trim(),
        content: request.content.trim(),
        userId: user.id,
        userEmail: user.email,
      });
    } catch {
      throw new GlobalExternalServiceErrorException();
    }

    return SubmitFeedbackResponse.from();
  }
}
