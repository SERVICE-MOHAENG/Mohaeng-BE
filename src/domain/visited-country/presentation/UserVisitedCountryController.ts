import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UserVisitedCountryService } from '../service/UserVisitedCountryService';
import { CountryService } from '../../country/service/CountryService';
import { AddVisitedCountryRequest } from './dto/request/AddVisitedCountryRequest';
import { GetMyVisitedCountriesRequest } from './dto/request/GetMyVisitedCountriesRequest';
import { VisitedCountryResponse } from './dto/response/VisitedCountryResponse';
import { VisitedCountriesResponse } from './dto/response/VisitedCountriesResponse';

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
    private readonly countryService: CountryService,
  ) {}

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

  /**
   * 방문 국가 추가
   * @description
   * - 사용자가 방문한 국가 추가
   * @param userId - 인증된 사용자 ID
   * @param request - 방문 국가 추가 요청
   * @returns 생성된 방문 국가 정보
   */
  @Post()
  @UserApiBearerAuth()
  @ApiOperation({ summary: '방문 국가 추가' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: VisitedCountryResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '국가를 찾을 수 없음' })
  async addVisitedCountry(
    @UserId() userId: string,
    @Body() request: AddVisitedCountryRequest,
  ): Promise<VisitedCountryResponse> {
    const country = await this.countryService.findById(request.countryId);
    const visitedCountry = await this.visitedCountryService.create(
      userId,
      country,
      request,
    );

    return VisitedCountryResponse.fromEntity(visitedCountry);
  }

  /**
   * 방문 국가 삭제
   * @description
   * - 방문 국가 삭제 (소유권 검증 포함)
   * @param userId - 인증된 사용자 ID
   * @param id - 방문 국가 ID
   */
  @Delete(':id')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '방문 국가 삭제' })
  @ApiParam({ name: 'id', description: '방문 국가 ID' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '방문 국가를 찾을 수 없음' })
  async deleteVisitedCountry(
    @UserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.visitedCountryService.delete(id, userId);
  }
}
