import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { UuidParam } from '../../../global/decorators/UuidParam';
import { TravelCourseService } from '../service/TravelCourseService';
import { CourseLikeService } from '../service/CourseLikeService';
import { GetCoursesRequest, CourseSortType } from './dto/request/GetCoursesRequest';
import { UpdateCourseCompletionRequest } from './dto/request/UpdateCourseCompletionRequest';
import { CourseResponse } from './dto/response/CourseResponse';
import { CourseDetailResponse } from './dto/response/CourseDetailResponse';
import { CoursesResponse } from './dto/response/CoursesResponse';

/**
 * TravelCourseController
 * @description
 * - 여행 코스 관련 HTTP 요청 처리
 * - 라우트 순서: literal 라우트 (mainpage, me, me/likes)를 parameterized 라우트 (:id) 앞에 배치
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
  @ApiQuery({ name: 'sortBy', required: false, enum: CourseSortType, example: CourseSortType.LATEST })
  @ApiQuery({ name: 'countryCode', required: false, example: 'JP' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '조회 성공', type: CoursesResponse })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getMainpageCourses(
    @Query() request: GetCoursesRequest,
  ): Promise<CoursesResponse> {
    return this.travelCourseService.getCoursesForMainPage(
      request.sortBy,
      request.countryCode,
      request.page,
      request.limit,
    );
  }

  /**
   * 여행 코스 완료 여부 변경
   */
  @Patch(':id/completion')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 완료 여부 변경' })
  @ApiParam({ name: 'id', description: '코스 ID' })
  @ApiResponse({ status: 200, description: '변경 성공', type: CourseResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async updateCompletionStatus(
    @UuidParam() id: string,
    @UserId() userId: string,
    @Body() request: UpdateCourseCompletionRequest,
  ): Promise<CourseResponse> {
    return this.travelCourseService.updateCompletionStatus(
      id,
      userId,
      request.isCompleted,
    );
  }

  /**
   * 여행 코스 상세 조회
   */
  @Get(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 상세 조회' })
  @ApiParam({ name: 'id', description: '코스 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CourseDetailResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async getCourseById(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<CourseDetailResponse> {
    return this.travelCourseService.findDetailById(id, userId);
  }

  /**
   * 다른 사용자의 로드맵 복사
   */
  @Post(':id/copy')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '로드맵 복사 (내 로드맵으로 가져오기)' })
  @ApiParam({ name: 'id', description: '복사할 코스 ID' })
  @ApiResponse({ status: 201, description: '복사 성공', type: CourseResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '비공개 코스 접근 불가' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async copyCourse(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<CourseResponse> {
    return this.travelCourseService.copyRoadmap(id, userId);
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
    @UuidParam() id: string,
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
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.courseLikeService.removeLike(userId, id);
  }
}
