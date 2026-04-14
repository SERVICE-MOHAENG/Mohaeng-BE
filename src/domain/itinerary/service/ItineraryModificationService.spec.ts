import { ItineraryModificationService } from './ItineraryModificationService';
import { CompletedItineraryEditLockedException } from '../exception/CompletedItineraryEditLockedException';
import { ChatRole } from '../../course/entity/ChatRole.enum';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { Queue } from 'bullmq';

const createService = ({
  travelCourseRepository,
  chatRepository,
}: {
  travelCourseRepository: Partial<Record<'findOne', jest.Mock>>;
  chatRepository?: Partial<Record<'find', jest.Mock>>;
}) =>
  new ItineraryModificationService(
    {} as unknown as ItineraryJobRepository,
    travelCourseRepository as unknown as typeof travelCourseRepository &
      import('typeorm').Repository<TravelCourse>,
    (chatRepository ?? {}) as unknown as typeof chatRepository &
      import('typeorm').Repository<CourseAiChat>,
    {} as unknown as Queue,
  );

describe('ItineraryModificationService', () => {
  it('blocks chat modification requests for completed roadmaps', async () => {
    const service = createService({
      travelCourseRepository: {
        findOne: jest.fn().mockResolvedValue({
          id: 'course-id',
          isCompleted: true,
          user: { id: 'user-id' },
          canModify: () => true,
        }),
      },
    });

    await expect(
      service.chatWithItinerary('user-id', 'course-id', '수정해줘'),
    ).rejects.toBeInstanceOf(CompletedItineraryEditLockedException);
  });

  it('returns chat history for the owned roadmap ordered by creation time', async () => {
    const createdAt = new Date('2026-04-14T10:00:00.000Z');
    const service = createService({
      travelCourseRepository: {
        findOne: jest.fn().mockResolvedValue({
          id: 'course-id',
          user: { id: 'user-id' },
        }),
      },
      chatRepository: {
        find: jest.fn().mockResolvedValue([
          {
            id: 'chat-1',
            role: ChatRole.USER,
            content: '여기 바꿔줘',
            createdAt,
          },
          {
            id: 'chat-2',
            role: ChatRole.AI,
            content: '이렇게 수정할게요',
            createdAt: new Date('2026-04-14T10:00:05.000Z'),
          },
        ]),
      },
    });

    await expect(
      service.getChatHistory('user-id', 'course-id'),
    ).resolves.toEqual({
      chats: [
        {
          id: 'chat-1',
          role: ChatRole.USER,
          content: '여기 바꿔줘',
          createdAt,
        },
        {
          id: 'chat-2',
          role: ChatRole.AI,
          content: '이렇게 수정할게요',
          createdAt: new Date('2026-04-14T10:00:05.000Z'),
        },
      ],
    });
  });
});
