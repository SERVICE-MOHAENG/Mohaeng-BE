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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
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
   * 작업 상태 조회 (Polling)
   */
  @Get(':jobId/status')
  @ApiOperation({ summary: '일정 생성 작업 상태 조회 (Polling)' })
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
