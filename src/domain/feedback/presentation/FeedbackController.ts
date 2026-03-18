import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../global/decorators/CurrentUser';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { CreateFeedbackRequest } from './dto/request/CreateFeedbackRequest';
import { SubmitFeedbackResponse } from './dto/response/SubmitFeedbackResponse';
import { FeedbackService } from '../service/FeedbackService';

type AuthenticatedUser = {
  id: string;
  email: string;
};

/**
 * Feedback Controller
 * @description
 * - 사용자 피드백 API
 */
@ApiTags('feedback')
@Controller('v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자 피드백 전송' })
  @ApiResponse({
    status: 200,
    description: '피드백 전송 성공',
    type: SubmitFeedbackResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Discord 웹훅 전송 실패',
  })
  async submitFeedback(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateFeedbackRequest,
  ): Promise<SubmitFeedbackResponse> {
    return this.feedbackService.submitFeedback(user.id, user.email, request);
  }
}
