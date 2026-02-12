import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { ItineraryJobRepository } from '../persistence/ItineraryJobRepository';
import { TravelCourse } from '../../course/entity/TravelCourse.entity';
import { CourseAiChat } from '../../course/entity/CourseAiChat.entity';

interface ModificationJobData {
  jobId: string;
  travelCourseId: string;
  userMessage: string;
}

/**
 * ItineraryModificationProcessor
 * @description
 * - BullMQ Worker: 큐에서 수정 작업을 꺼내 Python LLM 서버에 요청
 * - TravelCourse 전체 데이터를 JSON으로 직렬화
 * - CourseAiChat 이력 조회 (최근 10개)
 * - 재시도: 3회, 지수 백오프 (5s, 10s, 20s)
 */
@Processor('itinerary-modification')
export class ItineraryModificationProcessor extends WorkerHost {
  private readonly logger = new Logger(ItineraryModificationProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly itineraryJobRepository: ItineraryJobRepository,
    @InjectRepository(TravelCourse)
    private readonly travelCourseRepository: Repository<TravelCourse>,
    @InjectRepository(CourseAiChat)
    private readonly chatRepository: Repository<CourseAiChat>,
  ) {
    super();
  }

  async process(job: Job<ModificationJobData>): Promise<void> {
    const { jobId, travelCourseId, userMessage } = job.data;
    this.logger.log(
      `수정 작업 처리 시작: jobId=${jobId}, travelCourseId=${travelCourseId}`,
    );

    // 1. ItineraryJob 로드 및 PROCESSING 상태 변경
    const itineraryJob = await this.itineraryJobRepository.findById(jobId);
    if (!itineraryJob) {
      this.logger.error(`ItineraryJob not found: ${jobId}`);
      return;
    }

    itineraryJob.markProcessing();
    itineraryJob.incrementAttempt();
    await this.itineraryJobRepository.save(itineraryJob);

    // 2. TravelCourse 로드 (with relations)
    const course = await this.travelCourseRepository.findOne({
      where: { id: travelCourseId },
      relations: [
        'courseDays',
        'courseDays.coursePlaces',
        'courseDays.coursePlaces.place',
        'hashTags',
      ],
    });

    if (!course) {
      this.logger.error(`TravelCourse not found: ${travelCourseId}`);
      itineraryJob.markFailed('COURSE_NOT_FOUND', '로드맵을 찾을 수 없습니다');
      await this.itineraryJobRepository.save(itineraryJob);
      return;
    }

    // 3. 현재 로드맵 JSON 구성
    const currentItinerary = this.buildCurrentItineraryJson(course);

    // 4. 대화 이력 조회 (최근 10개)
    const chatHistory = await this.chatRepository.find({
      where: { travelCourse: { id: travelCourseId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const sessionHistory = this.buildSessionHistory(chatHistory);

    // 5. Python payload 구성
    const pythonBaseUrl = this.configService.get<string>('PYTHON_LLM_BASE_URL');
    const serviceSecret = this.configService.get<string>('SERVICE_SECRET');
    const callbackBaseUrl =
      this.configService.get<string>('CALLBACK_BASE_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || '8080'}`;
    const callbackUrl = `${callbackBaseUrl}/api/v1/itineraries/${jobId}/chat-result`;

    // 6. Python LLM 서버 호출
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${pythonBaseUrl}/api/v1/chat`,
          {
            job_id: jobId,
            callback_url: callbackUrl,
            current_itinerary: currentItinerary,
            user_query: userMessage,
            session_history: sessionHistory,
          },
          {
            headers: {
              'x-service-secret': serviceSecret,
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          },
        ),
      );

      this.logger.log(
        `Python 서버 응답: status=${response.status}, jobId=${jobId}`,
      );
    } catch (error) {
      this.logger.error(
        `Python 서버 호출 실패: jobId=${jobId}, error=${error.message}`,
      );
      // throw하여 BullMQ가 자동 재시도하도록 함
      throw error;
    }
  }

  /**
   * TravelCourse 전체를 Python API용 JSON으로 변환
   */
  private buildCurrentItineraryJson(course: TravelCourse) {
    // courseDays를 day_number 순으로 정렬
    const sortedDays = (course.courseDays || []).sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );

    return {
      start_date: this.formatDate(course.travelStartDay),
      end_date: this.formatDate(course.travelFinishDay),
      trip_days: course.days,
      nights: course.nights,
      people_count: course.peopleCount,
      tags: (course.hashTags || []).map((tag) => tag.tagName),
      title: course.title,
      summary: course.description || '',
      itinerary: sortedDays.map((day) => ({
        day_number: day.dayNumber,
        daily_date: this.formatDate(day.date),
        places: (day.coursePlaces || [])
          .sort((a, b) => a.visitOrder - b.visitOrder)
          .map((coursePlace) => ({
            place_name: coursePlace.place.name,
            place_id: coursePlace.place.placeId,
            address: coursePlace.place.address,
            latitude: coursePlace.place.latitude,
            longitude: coursePlace.place.longitude,
            place_url: coursePlace.place.placeUrl,
            description: coursePlace.description || '',
            visit_sequence: coursePlace.visitOrder,
            visit_time: coursePlace.visitTime || '09:00',
          })),
      })),
    };
  }

  /**
   * CourseAiChat 이력을 session_history 배열로 변환
   * @description 최근 10개를 시간순(오래된 것부터)으로 정렬
   */
  private buildSessionHistory(
    chats: CourseAiChat[],
  ): Array<{ role: string; content: string }> {
    return chats
      .reverse() // DESC로 조회했으므로 reverse하여 시간순으로
      .map((chat) => ({
        role: chat.role,
        content: chat.content,
      }));
  }

  /**
   * Date → YYYY-MM-DD 문자열 변환
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
