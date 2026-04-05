import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UuidParam } from '../../../global/decorators/UuidParam';
import { ServiceSecretGuard } from '../../itinerary/guard/ServiceSecretGuard';
import { UserPreferenceService } from '../service/UserPreferenceService';
import { PreferenceCallbackService } from '../service/PreferenceCallbackService';
import { RegionLikeService } from '../../country/service/RegionLikeService';
import { CreateUserPreferenceRequest } from './dto/request/CreateUserPreferenceRequest';
import { PreferenceCallbackRequest } from './dto/request/PreferenceCallbackRequest';
import { UserPreferenceResponse } from './dto/response/UserPreferenceResponse';
import { PreferenceRecommendationResponse } from './dto/response/PreferenceRecommendationResponse';

/**
 * UserPreferenceController
 * @description
 * - POST /v1/preferences                    : 선호도 저장 + BullMQ enqueue → 202
 * - GET  /v1/preferences/me                 : 내 선호도 조회
 * - GET  /v1/preferences/jobs/:jobId/status : 추천 작업 상태 polling
 * - GET  /v1/preferences/jobs/:jobId/result : 추천 결과 조회
 * - POST /v1/preferences/jobs/:jobId/result : Python 콜백 수신 (내부 전용)
 */
@ApiTags('preferences')
@Controller('v1/preferences')
@UseInterceptors(ResponseInterceptor)
export class UserPreferenceController {
  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly preferenceCallbackService: PreferenceCallbackService,
    private readonly regionLikeService: RegionLikeService,
  ) {}

  /**
   * 선호도 등록/수정 + 추천 작업 enqueue
   * - DB 저장 → PreferenceJob(PENDING) 생성 → BullMQ enqueue → 202 반환
   */
  @Post()
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: '선호도 등록/수정 후 여행지 추천 작업 시작 (비동기)',
  })
  @ApiResponse({ status: 202, description: '{ jobId, status: "PENDING" }' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createOrUpdate(
    @UserId() userId: string,
    @Body() request: CreateUserPreferenceRequest,
  ): Promise<{ jobId: string; status: string }> {
    return this.userPreferenceService.createOrUpdateAndEnqueue({
      userId,
      weather: request.weather,
      travelRange: request.travel_range,
      travelStyle: request.travel_style,
      foodPersonalities: request.food_personality,
      mainInterests: request.main_interests,
      budget: request.budget_level,
    });
  }

  /**
   * 내 선호도 조회
   */
  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 선호도 조회' })
  @ApiResponse({ status: 200, type: UserPreferenceResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getMyPreference(
    @UserId() userId: string,
  ): Promise<UserPreferenceResponse | null> {
    const preference = await this.userPreferenceService.findByUserId(userId);
    if (!preference) return null;
    return UserPreferenceResponse.from(preference);
  }

  /**
   * 내 최신 추천 결과 조회 (사용자 ID 기반)
   */
  @Get('me/result')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 추천 여행지 결과 조회' })
  @ApiResponse({
    status: 200,
    type: PreferenceRecommendationResponse,
    isArray: true,
  })
  async getMyResult(
    @UserId() userId: string,
  ): Promise<{ destinations: PreferenceRecommendationResponse[] }> {
    const recommendations =
      await this.preferenceCallbackService.getRecommendationsByUserId(userId);
    const regionIds = recommendations
      .map((recommendation) => recommendation.regionId)
      .filter((regionId): regionId is string => !!regionId);
    const [likeCounts, likedRegionIds] = await Promise.all([
      this.regionLikeService.getLikeCounts(regionIds),
      this.regionLikeService.getLikedRegionIds(userId, regionIds),
    ]);

    return {
      destinations: recommendations.map((recommendation) =>
        PreferenceRecommendationResponse.from(
          recommendation,
          recommendation.regionId
            ? (likeCounts[recommendation.regionId] ?? 0)
            : 0,
          recommendation.regionId
            ? likedRegionIds.has(recommendation.regionId)
            : false,
        ),
      ),
    };
  }

  /**
   * 추천 작업 상태 polling
   */
  @Get('jobs/:jobId/status')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '추천 작업 상태 조회 (Polling)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({
    status: 200,
    description: '{ status: "PENDING"|"PROCESSING"|"SUCCESS"|"FAILED" }',
  })
  async getJobStatus(
    @UserId() userId: string,
    @UuidParam('jobId') jobId: string,
  ): Promise<{ status: string }> {
    const status = await this.preferenceCallbackService.getJobStatus(
      userId,
      jobId,
    );
    return { status: status ?? 'NOT_FOUND' };
  }

  /**
   * 추천 결과 조회 (Region 한글명 + 이미지 + 설명 포함)
   */
  @Get('jobs/:jobId/result')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '추천 여행지 결과 조회 (이미지, 설명 포함)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  @ApiResponse({
    status: 200,
    type: PreferenceRecommendationResponse,
    isArray: true,
  })
  async getJobResult(
    @UuidParam('jobId') jobId: string,
    @UserId() userId: string,
  ): Promise<{ destinations: PreferenceRecommendationResponse[] }> {
    const recommendations =
      await this.preferenceCallbackService.getRecommendations(userId, jobId);
    const regionIds = recommendations
      .map((recommendation) => recommendation.regionId)
      .filter((regionId): regionId is string => !!regionId);
    const [likeCounts, likedRegionIds] = await Promise.all([
      this.regionLikeService.getLikeCounts(regionIds),
      this.regionLikeService.getLikedRegionIds(userId, regionIds),
    ]);

    return {
      destinations: recommendations.map((recommendation) =>
        PreferenceRecommendationResponse.from(
          recommendation,
          recommendation.regionId
            ? (likeCounts[recommendation.regionId] ?? 0)
            : 0,
          recommendation.regionId
            ? likedRegionIds.has(recommendation.regionId)
            : false,
        ),
      ),
    };
  }

  /**
   * Python LLM 추천 결과 콜백 (내부 전용)
   * POST /v1/preferences/jobs/:jobId/result
   */
  @Post('jobs/:jobId/result')
  @UseGuards(ServiceSecretGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Python LLM 추천 결과 콜백 (내부 전용)' })
  @ApiParam({ name: 'jobId', description: '작업 ID' })
  async handleCallback(
    @UuidParam('jobId') jobId: string,
    @Body() body: PreferenceCallbackRequest,
  ): Promise<void> {
    if (body.status === 'SUCCESS') {
      await this.preferenceCallbackService.handleSuccess(jobId, body.data!);
    } else {
      await this.preferenceCallbackService.handleFailure(jobId, body.error!);
    }
  }
}
