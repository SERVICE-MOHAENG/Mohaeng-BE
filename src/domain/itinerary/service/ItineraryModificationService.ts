import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { ItineraryJob } from '../entity/ItineraryJob.entity';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';
import { ChatWithItineraryResponse } from '../presentation/dto/response/ChatWithItineraryResponse';
import { ItineraryModificationJobStatusResponse } from '../presentation/dto/response/ItineraryModificationJobStatusResponse';
import { ItineraryNotFoundException } from '../exception/ItineraryNotFoundException';
import { UnauthorizedItineraryAccessException } from '../exception/UnauthorizedItineraryAccessException';
import { ItineraryJobNotFoundException } from '../exception/ItineraryJobNotFoundException';
import { ChatLimitExceededException } from '../exception/ChatLimitExceededException';

/**
 * ItineraryModificationService
 * @description
 * - 로드맵 수정 채팅 요청 처리
 * - BullMQ 큐에 수정 작업 등록
 * - 수정 작업 상태 조회
 */
@Injectable()
export class ItineraryModificationService {
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
    // 1. TravelCourse 존재 확인
    const course = await this.travelCourseRepository.findOne({
      where: { id: itineraryId },
      relations: ['user'],
    });

    if (!course) {
      throw new ItineraryNotFoundException();
    }

    // 2. 권한 확인 (본인의 로드맵인지 확인)
    if (course.user.id !== userId) {
      throw new UnauthorizedItineraryAccessException();
    }

    // 3. 대화 개수 확인 (최대 10개 제한)
    const chatCount = await this.chatRepository.count({
      where: { travelCourse: { id: itineraryId } },
    });

    if (chatCount >= 10) {
      throw new ChatLimitExceededException();
    }

    // 4. ItineraryJob 생성 (MODIFICATION)
    const job = ItineraryJob.createModificationJob(userId, itineraryId, message);
    const savedJob = await this.itineraryJobRepository.save(job);

    // 5. BullMQ 큐에 작업 추가
    await this.modificationQueue.add('modify-itinerary', {
      jobId: savedJob.id,
      travelCourseId: itineraryId,
      userMessage: message,
    });

    return ChatWithItineraryResponse.from(savedJob);
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
}
