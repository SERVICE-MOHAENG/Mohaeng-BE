import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UuidParam } from '../../../global/decorators/UuidParam';
import { ServiceSecretGuard } from '../guard/ServiceSecretGuard';
import { ItineraryService } from '../service/ItineraryService';
import { ItineraryCallbackService } from '../service/ItineraryCallbackService';
import { ItineraryModificationService } from '../service/ItineraryModificationService';
import { ItineraryModificationCallbackService } from '../service/ItineraryModificationCallbackService';
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
import { ItineraryChatHistoryResponse } from './dto/response/ItineraryChatHistoryResponse';

@ApiTags('itineraries')
@Controller('v1/itineraries')
@UseInterceptors(ResponseInterceptor)
export class ItineraryController {
  constructor(
    private readonly itineraryService: ItineraryService,
    private readonly itineraryCallbackService: ItineraryCallbackService,
    private readonly itineraryModificationService: ItineraryModificationService,
    private readonly itineraryModificationCallbackService: ItineraryModificationCallbackService,
  ) {}

  /**
   * 로드맵 설문 저장 및 일정 생성 요청 시작
   */
  @Post('surveys')
  @ApiOperation({ summary: '로드맵 설문 저장' })
  @ApiResponse({ status: 201, type: CreateSurveyResponse })
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
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
   * 작업 상태 조회 (Polling)
   */
  @Get(':jobId/status')
  @ApiOperation({ summary: '일정 생성 작업 상태 조회 (Polling)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({ status: 200, type: ItineraryJobStatusResponse })
  @UserApiBearerAuth()
  async getStatus(@UserId() userId: string, @UuidParam('jobId') jobId: string) {
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
  async getResult(@UserId() userId: string, @UuidParam('jobId') jobId: string) {
    const result = await this.itineraryService.getJobResult(userId, jobId);
    return { result };
  }

  /**
   * 로드맵 수정 채팅 내역 조회
   */
  @Get(':id/chats')
  @ApiOperation({ summary: '로드맵 수정 채팅 내역 조회' })
  @ApiParam({ name: 'id', description: '로드맵 ID' })
  @ApiResponse({ status: 200, type: ItineraryChatHistoryResponse })
  @UserApiBearerAuth()
  async getChatHistory(
    @UserId() userId: string,
    @UuidParam() itineraryId: string,
  ) {
    return this.itineraryModificationService.getChatHistory(
      userId,
      itineraryId,
    );
  }

  /**
   * Python 서버 콜백 (내부 서비스 인증)
   */
  @Post(':jobId/result')
  @ApiOperation({ summary: 'Python LLM 서버 콜백 (내부 전용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiHeader({
    name: 'x-service-secret',
    description: '내부 서비스 인증 시크릿',
    required: true,
  })
  @ApiBody({ type: ItineraryCallbackRequest })
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @UuidParam('jobId') jobId: string,
    @Body() body: ItineraryCallbackRequest,
  ) {
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
    @UuidParam() itineraryId: string,
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
    @UuidParam('jobId') jobId: string,
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
  @ApiHeader({
    name: 'x-service-secret',
    description: '내부 서비스 인증 시크릿',
    required: true,
  })
  @ApiBody({ type: ItineraryModificationCallbackRequest })
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  async handleModificationCallback(
    @UuidParam('jobId') jobId: string,
    @Body() body: ItineraryModificationCallbackRequest,
  ) {
    if (body.status === 'FAILED') {
      await this.itineraryModificationCallbackService.handleFailure(
        jobId,
        body.error!,
      );
    } else {
      // SUCCESS, ASK_CLARIFICATION, GENERAL_CHAT, REJECTED
      await this.itineraryModificationCallbackService.handleSuccess(
        jobId,
        body.user_query || '',
        body.status,
        body.message || '',
        body.modified_itinerary,
        body.diff_keys,
      );
    }
  }
}
