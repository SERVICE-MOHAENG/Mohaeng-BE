import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { ChatWithItineraryResponse } from '../presentation/dto/response/ChatWithItineraryResponse';
import {
  ItineraryChatHistoryItemResponse,
  ItineraryChatHistoryResponse,
} from '../presentation/dto/response/ItineraryChatHistoryResponse';
import { ItineraryModificationJobStatusResponse } from '../presentation/dto/response/ItineraryModificationJobStatusResponse';
import { ItineraryNotFoundException } from '../exception/ItineraryNotFoundException';
import { UnauthorizedItineraryAccessException } from '../exception/UnauthorizedItineraryAccessException';
import { ItineraryJobNotFoundException } from '../exception/ItineraryJobNotFoundException';
import { ItineraryJobAlreadyProcessingException } from '../exception/ItineraryJobAlreadyProcessingException';
import { ChatLimitExceededException } from '../exception/ChatLimitExceededException';
import { CompletedItineraryEditLockedException } from '../exception/CompletedItineraryEditLockedException';

/**
 * ItineraryModificationService
 * @description
 * - 로드맵 수정 채팅 요청 처리
 * - BullMQ 큐에 수정 작업 등록
 * - 수정 작업 상태 조회
 */
@Injectable()
export class ItineraryModificationService {
  private readonly logger = new Logger(ItineraryModificationService.name);

  constructor(
    private readonly itineraryJobRepository: ItineraryJobRepository,
    @InjectRepository(TravelCourse)
    private readonly travelCourseRepository: Repository<TravelCourse>,
    @InjectRepository(CourseAiChat)
    private readonly chatRepository: Repository<CourseAiChat>,
    @InjectQueue('itinerary-modification')
    private readonly modificationQueue: Queue,
  ) {}

  /**
   * 로드맵 수정 채팅 요청
   * @description
   * - TravelCourse 존재 및 권한 확인
   * - ItineraryJob 생성 (MODIFICATION)
   * - BullMQ 큐에 작업 추가
   */
  async chatWithItinerary(
    userId: string,
    itineraryId: string,
    message: string,
  ): Promise<ChatWithItineraryResponse> {
    const course = await this.findOwnedCourse(userId, itineraryId);

    // 3. 완료된 로드맵 수정 잠금
    if (course.isCompleted) {
      throw new CompletedItineraryEditLockedException();
    }

    // 4. AI 자연어 수정 횟수 확인 (최대 5회)
    if (!course.canModify()) {
      throw new ChatLimitExceededException();
    }

    // 5. 동시 수정 방지: PENDING/PROCESSING 상태의 작업이 있는지 확인
    const pendingJob =
      await this.itineraryJobRepository.findActiveByTravelCourseId(itineraryId);

    if (pendingJob) {
      throw new ItineraryJobAlreadyProcessingException();
    }

    // 6. ItineraryJob 생성 (MODIFICATION)
    const job = ItineraryJob.createModificationJob(
      userId,
      itineraryId,
      message,
    );
    const savedJob = await this.itineraryJobRepository.save(job);

    // 7. modificationCount 증가 (최대 5회 제한 추적용)
    course.incrementModificationCount();
    await this.travelCourseRepository.save(course);

    // 8. BullMQ 큐에 작업 추가
    try {
      await this.modificationQueue.add(
        'modify-itinerary',
        {
          jobId: savedJob.id,
          travelCourseId: itineraryId,
          userMessage: message,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // 5s → 10s → 20s
          },
        },
      );
    } catch (err) {
      savedJob.markFailed('QUEUE_ERROR', '작업 큐 등록에 실패했습니다');
      try {
        await this.itineraryJobRepository.save(savedJob);
      } catch (saveErr) {
        this.logger.error(
          `Job FAILED 상태 저장 실패: jobId=${savedJob.id}`,
          saveErr,
        );
      }
      throw err;
    }

    return ChatWithItineraryResponse.from(savedJob);
  }

  /**
   * 로드맵 수정 채팅 내역 조회
   */
  async getChatHistory(
    userId: string,
    itineraryId: string,
  ): Promise<ItineraryChatHistoryResponse> {
    await this.findOwnedCourse(userId, itineraryId);

    const chats = await this.chatRepository.find({
      where: { travelCourse: { id: itineraryId } },
      order: { createdAt: 'ASC' },
    });

    return ItineraryChatHistoryResponse.from(
      chats.map((chat) => ItineraryChatHistoryItemResponse.from(chat)),
    );
  }

  /**
   * 수정 작업 상태 조회
   */
  async getModificationJobStatus(
    userId: string,
    jobId: string,
  ): Promise<ItineraryModificationJobStatusResponse> {
    const job = await this.itineraryJobRepository.findByIdAndUserId(
      jobId,
      userId,
    );

    if (!job) {
      throw new ItineraryJobNotFoundException();
    }

    return ItineraryModificationJobStatusResponse.from(job);
  }

  private async findOwnedCourse(
    userId: string,
    itineraryId: string,
  ): Promise<TravelCourse> {
    const course = await this.travelCourseRepository.findOne({
      where: { id: itineraryId },
      relations: ['user'],
    });

    if (!course) {
      throw new ItineraryNotFoundException();
    }

    if (course.user.id !== userId) {
      throw new UnauthorizedItineraryAccessException();
    }

    return course;
  }
}
