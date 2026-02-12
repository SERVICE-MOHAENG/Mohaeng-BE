import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Observable, fromEvent } from 'rxjs';
import { map, takeUntil, startWith } from 'rxjs/operators';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { ServiceSecretGuard } from '../guard/ServiceSecretGuard';
import { ItineraryService } from '../service/ItineraryService';
import { ItineraryCallbackService } from '../service/ItineraryCallbackService';
import { ItineraryModificationService } from '../service/ItineraryModificationService';
import { ItineraryModificationCallbackService } from '../service/ItineraryModificationCallbackService';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';
import { CreateItineraryRequest } from './dto/request/CreateItineraryRequest';
import { CreateSurveyRequest } from './dto/request/CreateSurveyRequest';
import { ItineraryCallbackRequest } from './dto/request/ItineraryCallbackRequest';
import { ChatWithItineraryRequest } from './dto/request/ChatWithItineraryRequest';
import { ItineraryModificationCallbackRequest } from './dto/request/ItineraryModificationCallbackRequest';
import { CreateItineraryResponse } from './dto/response/CreateItineraryResponse';
import { CreateSurveyResponse } from './dto/response/CreateSurveyResponse';
import { ItineraryJobStatusResponse } from './dto/response/ItineraryJobStatusResponse';
import { ItineraryResultResponse } from './dto/response/ItineraryResultResponse';
import { ChatWithItineraryResponse } from './dto/response/ChatWithItineraryResponse';
import { ItineraryModificationJobStatusResponse } from './dto/response/ItineraryModificationJobStatusResponse';

@ApiTags('itineraries')
@Controller('v1/itineraries')
@UseInterceptors(ResponseInterceptor)
export class ItineraryController {
  constructor(
    private readonly itineraryService: ItineraryService,
    private readonly itineraryCallbackService: ItineraryCallbackService,
    private readonly itineraryModificationService: ItineraryModificationService,
    private readonly itineraryModificationCallbackService: ItineraryModificationCallbackService,
    private readonly redisService: GlobalRedisService,
  ) {}

  /**
   * 로드맵 설문 저장 및 일정 생성 요청 시작
   */
  @Post('surveys')
  @ApiOperation({ summary: '로드맵 설문 저장 후 비동기 생성 시작' })
  @ApiResponse({ status: 202, type: CreateSurveyResponse })
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  async createSurvey(
    @UserId() userId: string,
    @Body() request: CreateSurveyRequest,
  ) {
    const result = await this.itineraryService.createSurvey(userId, request);
    return { survey: result };
  }

  /**
   * 일정 생성 요청
   */
  @Post()
  @ApiOperation({ summary: '여행 일정 생성 요청 (비동기)' })
  @ApiResponse({ status: 202, type: CreateItineraryResponse })
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  async createItinerary(
    @UserId() userId: string,
    @Body() request: CreateItineraryRequest,
  ) {
    const result = await this.itineraryService.createItinerary(
      userId,
      request.surveyId,
    );
    return { itinerary: result };
  }

  /**
   * SSE로 작업 상태 실시간 수신 (권장)
   */
  @Sse(':jobId/events')
  @ApiOperation({ summary: 'SSE로 작업 상태 실시간 수신 (권장)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @UserApiBearerAuth()
  async subscribeToJobStatus(
    @UserId() userId: string,
    @Param('jobId') jobId: string,
  ): Promise<Observable<MessageEvent>> {
    // 권한 확인
    const job = await this.itineraryService.getJobStatus(userId, jobId);
    if (!job) {
      throw new BadRequestException('작업을 찾을 수 없습니다');
    }

    // Redis 채널 구독
    const channel = `job:${jobId}:status`;

    return new Observable<MessageEvent>((subscriber) => {
      let unsubscribe: (() => void) | null = null;

      // 초기 상태 전송
      subscriber.next({
        data: { status: job.status, jobId },
      } as MessageEvent);

      // 이미 완료/실패 상태면 즉시 종료
      if (job.status === 'SUCCESS' || job.status === 'FAILED') {
        subscriber.complete();
        return;
      }

      // Redis 구독 시작
      this.redisService.subscribe(channel, (message) => {
        const data = JSON.parse(message);
        subscriber.next({ data } as MessageEvent);

        // 완료/실패 시 연결 종료
        if (data.status === 'SUCCESS' || data.status === 'FAILED') {
          subscriber.complete();
          if (unsubscribe) {
            unsubscribe();
          }
        }
      }).then((unsub) => {
        unsubscribe = unsub;
      });

      // 클라이언트 연결 종료 시 정리
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    });
  }

  /**
   * 작업 상태 polling (하위 호환성)
   */
  @Get(':jobId/status')
  @ApiOperation({ summary: '일정 생성 작업 상태 조회 (Polling, 하위 호환용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({ status: 200, type: ItineraryJobStatusResponse })
  @UserApiBearerAuth()
  async getStatus(
    @UserId() userId: string,
    @Param('jobId') jobId: string,
  ) {
    const result = await this.itineraryService.getJobStatus(userId, jobId);
    return { status: result };
  }

  /**
   * 작업 결과 조회 (전체 데이터)
   */
  @Get(':jobId')
  @ApiOperation({ summary: '일정 생성 결과 조회' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({ status: 200, type: ItineraryResultResponse })
  @UserApiBearerAuth()
  async getResult(
    @UserId() userId: string,
    @Param('jobId') jobId: string,
  ) {
    const result = await this.itineraryService.getJobResult(userId, jobId);
    return { result };
  }

  /**
   * Python 서버 콜백 (내부 서비스 인증)
   */
  @Post(':jobId/result')
  @ApiOperation({ summary: 'Python LLM 서버 콜백 (내부 전용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiBody({ type: ItineraryCallbackRequest })
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Param('jobId') jobId: string,
    @Body() body: ItineraryCallbackRequest,
  ) {
    if (body.status === 'SUCCESS' && !body.data) {
      throw new BadRequestException(
        'SUCCESS 콜백에는 data가 필수입니다',
      );
    }
    if (body.status === 'FAILED' && !body.error) {
      throw new BadRequestException(
        'FAILED 콜백에는 error가 필수입니다',
      );
    }

    if (body.status === 'SUCCESS' && body.data) {
      await this.itineraryCallbackService.handleSuccess(
        jobId,
        body.data as import('../service/ItineraryCallbackService').ItinerarySuccessPayload,
      );
    } else if (body.status === 'FAILED' && body.error) {
      await this.itineraryCallbackService.handleFailure(jobId, body.error);
    }
  }

  /**
   * 로드맵 수정 채팅 요청
   */
  @Post(':id/chat')
  @ApiOperation({ summary: '로드맵 수정 채팅 요청' })
  @ApiParam({ name: 'id', description: '로드맵 ID' })
  @ApiBody({ type: ChatWithItineraryRequest })
  @ApiResponse({ status: 202, type: ChatWithItineraryResponse })
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  async chatWithItinerary(
    @UserId() userId: string,
    @Param('id') itineraryId: string,
    @Body() request: ChatWithItineraryRequest,
  ) {
    const result = await this.itineraryModificationService.chatWithItinerary(
      userId,
      itineraryId,
      request.message,
    );
    return { chat: result };
  }

  /**
   * 수정 작업 상태 조회
   */
  @Get('modification-jobs/:jobId/status')
  @ApiOperation({ summary: '로드맵 수정 작업 상태 조회' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({ status: 200, type: ItineraryModificationJobStatusResponse })
  @UserApiBearerAuth()
  async getModificationJobStatus(
    @UserId() userId: string,
    @Param('jobId') jobId: string,
  ) {
    const result =
      await this.itineraryModificationService.getModificationJobStatus(
        userId,
        jobId,
      );
    return { status: result };
  }

  /**
   * Python 서버 수정 콜백 (내부 서비스 인증)
   */
  @Post(':jobId/chat-result')
  @ApiOperation({ summary: 'Python LLM 서버 수정 콜백 (내부 전용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiBody({ type: ItineraryModificationCallbackRequest })
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  async handleModificationCallback(
    @Param('jobId') jobId: string,
    @Body() body: ItineraryModificationCallbackRequest,
  ) {
    if (body.status === 'SUCCESS') {
      await this.itineraryModificationCallbackService.handleSuccess(
        jobId,
        body.user_query || '',
        body as import('../service/ItineraryModificationCallbackService').ModificationSuccessPayload,
      );
    } else if (body.status === 'FAILED' && body.error) {
      await this.itineraryModificationCallbackService.handleFailure(
        jobId,
        body.error,
      );
    }
  }
}
