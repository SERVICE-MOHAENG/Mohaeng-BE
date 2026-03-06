import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { TravelCourseService } from '../service/TravelCourseService';
import { CourseLikeService } from '../service/CourseLikeService';
import { GetMyCoursesRequest } from './dto/request/GetMyCoursesRequest';
import { ReorderCoursePlacesRequest } from './dto/request/ReorderCoursePlacesRequest';
import { GetCoursesRequest } from './dto/request/GetCoursesRequest';
import { CourseResponse } from './dto/response/CourseResponse';
import { CoursesResponse } from './dto/response/CoursesResponse';
import { CourseLikesResponse } from './dto/response/CourseLikesResponse';

/**
 * TravelCourseController
 * @description
 * - 여행 코스 관련 HTTP 요청 처리
 * - 라우트 순서: literal 라우트 (mainpage, me, me/likes, days)를 parameterized 라우트 (:id) 앞에 배치
 */
@ApiTags('courses')
@Controller('v1/courses')
export class TravelCourseController {
  constructor(
    private readonly travelCourseService: TravelCourseService,
    private readonly courseLikeService: CourseLikeService,
  ) {}

  /**
   * 여행 코스 목록 조회 (메인페이지용)
   */
  @Get('mainpage')
  @ApiOperation({ summary: '여행 코스 목록 조회 (메인페이지)' })
  @ApiQuery({ name: 'countryCode', required: false, example: 'JP' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '조회 성공', type: CoursesResponse })
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

  /**
   * 내 여행 코스 목록 조회
   */
  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 여행 코스 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '조회 성공', type: CoursesResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getMyCourses(
    @UserId() userId: string,
    @Query() request: GetMyCoursesRequest,
  ): Promise<CoursesResponse> {
    return this.travelCourseService.getMyCourses(
      userId,
      request.page,
      request.limit,
    );
  }

  /**
   * 내 좋아요 목록 조회
   */
  @Get('me/likes')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 좋아요 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '조회 성공', type: CourseLikesResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getMyLikes(
    @UserId() userId: string,
    @Query() request: GetMyCoursesRequest,
  ): Promise<CourseLikesResponse> {
    const page = request.page ?? 1;
    const limit = request.limit ?? 20;
    const [likes, total] = await this.courseLikeService.getMyLikes(
      userId,
      page,
      limit,
    );
    return CourseLikesResponse.from(likes, total, page, limit);
  }

  /**
   * 특정 day 장소 방문 순서 변경
   * @description
   * - placeIds 순서대로 visitOrder 재배정
   * - 순서 변경 시 해당 day의 모든 visitTime이 null로 초기화됨
   *   (방문 시간을 유지하려면 자연어 수정 요청을 사용할 것)
   * - 자연어 수정 요청은 로드맵 당 최대 5회 가능
   * - placeIds는 해당 day의 모든 course_place_id를 포함해야 함
   */
  @Patch('days/:dayId/places/reorder')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '특정 day 장소 방문 순서 변경',
    description:
      '드래그로 순서 변경 시 visitTime이 초기화됩니다. ' +
      '방문 시간을 유지하려면 자연어 수정 요청을 사용하세요. ' +
      '자연어 수정 요청은 로드맵 당 최대 5회 가능합니다.',
  })
  @ApiParam({ name: 'dayId', description: 'day ID' })
  @ApiResponse({ status: 204, description: '순서 변경 성공 (visitTime 초기화됨)' })
  @ApiResponse({ status: 400, description: '유효하지 않은 장소 ID' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: 'day를 찾을 수 없음' })
  async reorderCoursePlaces(
    @Param('dayId') dayId: string,
    @UserId() userId: string,
    @Body() request: ReorderCoursePlacesRequest,
  ): Promise<void> {
    await this.travelCourseService.reorderCoursePlaces(
      dayId,
      userId,
      request.placeIds,
    );
  }

  /**
   * 여행 코스 상세 조회
   */
  @Get(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 상세 조회' })
  @ApiParam({ name: 'id', description: '코스 ID' })
  @ApiResponse({ status: 200, description: '조회 성공', type: CourseResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async getCourseById(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<CourseResponse> {
    return this.travelCourseService.findByIdWithUserStatus(id, userId);
  }

  /**
   * 여행 코스 좋아요 추가
   */
  @Post(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '여행 코스 좋아요 추가' })
  @ApiParam({ name: 'id', description: '코스 ID' })
  @ApiResponse({ status: 201, description: '좋아요 추가 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 좋아요한 코스' })
  async addLike(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.courseLikeService.addLike(userId, id);
  }

  /**
   * 여행 코스 좋아요 삭제
   */
  @Delete(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '여행 코스 좋아요 삭제' })
  @ApiParam({ name: 'id', description: '코스 ID' })
  @ApiResponse({ status: 204, description: '좋아요 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async removeLike(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.courseLikeService.removeLike(userId, id);
  }
}
