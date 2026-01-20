import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TravelCourseService } from '../service/TravelCourseService';
import { GetCoursesRequest } from './dto/request/GetCoursesRequest';
import { CoursesResponse } from './dto/response/CoursesResponse';

/**
 * TravelCourseController
 * @description
 * - 여행 코스 관련 HTTP 요청 처리
 */
@ApiTags('courses')
@Controller('v1/courses')
export class TravelCourseController {
  constructor(private readonly travelCourseService: TravelCourseService) {}

  /**
   * 여행 코스 목록 조회 (메인페이지용)
   * @description
   * - 공개된 여행 코스를 좋아요순으로 조회
   * - 국가별 필터링 가능
   * - 최대 10개까지 조회
   * @param request - 조회 요청 (국가, 페이지네이션)
   * @returns CoursesResponse
   */
  @Get('mainpage')
  @ApiOperation({ summary: '여행 코스 목록 조회 (메인페이지)' })
  @ApiQuery({
    name: 'countryCode',
    description: '국가 코드 (ISO 3166-1 alpha-2, 필터링용)',
    required: false,
    example: 'JP',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지 크기 (최대 10개)',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CoursesResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getMainpageCourses(
    @Query() request: GetCoursesRequest,
  ): Promise<CoursesResponse> {
    return this.travelCourseService.getCoursesForMainPage(
      request.countryCode,
      request.page,
      request.limit,
    );
  }
}
