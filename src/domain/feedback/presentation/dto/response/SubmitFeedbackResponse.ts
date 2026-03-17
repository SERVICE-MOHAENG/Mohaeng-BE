import { ApiProperty } from '@nestjs/swagger';

export class SubmitFeedbackResponse {
  @ApiProperty({
    description: '응답 메시지',
    example: '피드백이 접수되었습니다.',
  })
  message: string;

  static from(): SubmitFeedbackResponse {
    const response = new SubmitFeedbackResponse();
    response.message = '피드백이 접수되었습니다.';
    return response;
  }
}
