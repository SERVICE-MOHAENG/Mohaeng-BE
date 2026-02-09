import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { ServiceSecretGuard } from '../guard/ServiceSecretGuard';
import { ItineraryService } from '../service/ItineraryService';
import { ItineraryCallbackService } from '../service/ItineraryCallbackService';
import { CreateItineraryRequest } from './dto/request/CreateItineraryRequest';
import { CreateItineraryResponse } from './dto/response/CreateItineraryResponse';
import { ItineraryJobStatusResponse } from './dto/response/ItineraryJobStatusResponse';
import { ItineraryResultResponse } from './dto/response/ItineraryResultResponse';

@ApiTags('itineraries')
@Controller('v1/itineraries')
@UseInterceptors(ResponseInterceptor)
export class ItineraryController {
  constructor(
    private readonly itineraryService: ItineraryService,
    private readonly itineraryCallbackService: ItineraryCallbackService,
  ) {}

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
   * 작업 상태 polling
   */
  @Get(':jobId/status')
  @ApiOperation({ summary: '일정 생성 작업 상태 조회' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({ status: 200, type: ItineraryJobStatusResponse })
  @UserApiBearerAuth()
  async getStatus(@Param('jobId') jobId: string) {
    const result = await this.itineraryService.getJobStatus(jobId);
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
  async getResult(@Param('jobId') jobId: string) {
    const result = await this.itineraryService.getJobResult(jobId);
    return { result };
  }

  /**
   * Python 서버 콜백 (내부 서비스 인증)
   */
  @Post(':jobId/result')
  @ApiOperation({ summary: 'Python LLM 서버 콜백 (내부 전용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Param('jobId') jobId: string,
    @Body() body: { status: string; data?: unknown; error?: { code: string; message: string } },
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
}
