import { ItineraryModificationService } from './ItineraryModificationService';
import { CompletedItineraryEditLockedException } from '../exception/CompletedItineraryEditLockedException';

describe('ItineraryModificationService', () => {
  it('blocks chat modification requests for completed roadmaps', async () => {
    const service = new ItineraryModificationService(
      {} as any,
      {
        findOne: jest.fn().mockResolvedValue({
          id: 'course-id',
          isCompleted: true,
          user: { id: 'user-id' },
          canModify: () => true,
        }),
      } as any,
      {} as any,
    );

    await expect(
      service.chatWithItinerary('user-id', 'course-id', '수정해줘'),
    ).rejects.toBeInstanceOf(CompletedItineraryEditLockedException);
  });
});
