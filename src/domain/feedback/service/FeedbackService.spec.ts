import { GlobalExternalServiceErrorException } from '../../../global/exception/GlobalExternalServiceErrorException';
import { FeedbackService } from './FeedbackService';

describe('FeedbackService', () => {
  it('sends trimmed feedback payload to Discord', async () => {
    const discordService = {
      sendFeedback: jest.fn().mockResolvedValue(undefined),
    } as any;

    const service = new FeedbackService(discordService);

    const result = await service.submitFeedback(
      {
        id: 'user-id',
        email: 'user@example.com',
      },
      {
        title: '  일정 수정이 어려워요  ',
        content: '  수정 후 결과를 바로 확인할 수 있으면 좋겠습니다.  ',
      },
    );

    expect(discordService.sendFeedback).toHaveBeenCalledWith({
      title: '일정 수정이 어려워요',
      content: '수정 후 결과를 바로 확인할 수 있으면 좋겠습니다.',
      userId: 'user-id',
      userEmail: 'user@example.com',
    });
    expect(result.message).toBe('피드백이 접수되었습니다.');
  });

  it('throws external service error when Discord delivery fails', async () => {
    const discordService = {
      sendFeedback: jest.fn().mockRejectedValue(new Error('webhook failed')),
    } as any;

    const service = new FeedbackService(discordService);

    await expect(
      service.submitFeedback(
        {
          id: 'user-id',
          email: 'user@example.com',
        },
        {
          title: '제목',
          content: '내용',
        },
      ),
    ).rejects.toBeInstanceOf(GlobalExternalServiceErrorException);
  });
});
