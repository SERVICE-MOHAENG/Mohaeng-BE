import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UserVisitedCountryService } from '../service/UserVisitedCountryService';
import { GetMyVisitedCountriesRequest } from './dto/request/GetMyVisitedCountriesRequest';
import { VisitedCountryResponse } from './dto/response/VisitedCountryResponse';
import { VisitedCountriesResponse } from './dto/response/VisitedCountriesResponse';
import { VisitedCountryCountResponse } from './dto/response/VisitedCountryCountResponse';

/**
 * UserVisitedCountryController
 * @description
 * - 사용자 방문 국가 관련 HTTP 요청 처리
 */
@ApiTags('visited-countries')
@Controller('v1/visited-countries')
export class UserVisitedCountryController {
  constructor(
    private readonly visitedCountryService: UserVisitedCountryService,
  ) {}

  /**
   * 내 방문 국가 수 조회
   */
  @Get('me/count')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 방문 국가 수 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: VisitedCountryCountResponse,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async getMyVisitedCountryCount(
    @UserId() userId: string,
  ): Promise<VisitedCountryCountResponse> {
    const count = await this.visitedCountryService.getVisitedCountryCount(
      userId,
    );
    return VisitedCountryCountResponse.from(count);
  }

  /**
   * 내 방문 국가 목록 조회
   * @description
   * - 인증된 사용자의 방문 국가 목록 조회 (DB 레벨 페이지네이션)
   * @param userId - 인증된 사용자 ID
   * @param request - 페이지네이션 요청
   * @returns 방문 국가 목록
   */
  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 방문 국가 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: VisitedCountriesResponse,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async getMyVisitedCountries(
    @UserId() userId: string,
    @Query() request: GetMyVisitedCountriesRequest,
  ): Promise<VisitedCountriesResponse> {
    const page = request.page ?? 1;
    const limit = request.limit ?? 10;

    const [visitedCountries, total] =
      await this.visitedCountryService.findByUserIdWithPagination(
        userId,
        page,
        limit,
      );

    const items = visitedCountries.map((vc) =>
      VisitedCountryResponse.fromEntity(vc),
    );

    return {
      items,
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    };
  }
}
