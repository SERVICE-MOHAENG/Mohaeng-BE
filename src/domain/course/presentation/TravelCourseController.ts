import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CourseBookmarkService } from '../service/CourseBookmarkService';
import { CourseLikeService } from '../service/CourseLikeService';
import { GetMyCoursesRequest } from './dto/request/GetMyCoursesRequest';
import { GetCoursesRequest } from './dto/request/GetCoursesRequest';
import { CourseResponse } from './dto/response/CourseResponse';
import { CoursesResponse } from './dto/response/CoursesResponse';
import { CourseBookmarksResponse } from './dto/response/CourseBookmarksResponse';
import { CourseLikesResponse } from './dto/response/CourseLikesResponse';

/**
 * TravelCourseController
 * @description
 * - 여행 코스 관련 HTTP 요청 처리
 * - 라우트 순서: literal 라우트 (mainpage, me, me/bookmarks, me/likes)를 parameterized 라우트 (:id) 앞에 배치
 */
@ApiTags('courses')
@Controller('v1/courses')
export class TravelCourseController {
  constructor(
    private readonly travelCourseService: TravelCourseService,
    private readonly courseBookmarkService: CourseBookmarkService,
    private readonly courseLikeService: CourseLikeService,
  ) {}

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

  /**
   * 내 여행 코스 목록 조회
   * @description
   * - 로그인한 사용자의 여행 코스 목록 조회 (페이지네이션)
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 페이지네이션 요청
   * @returns CoursesResponse
   */
  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 여행 코스 목록 조회' })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지 크기',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CoursesResponse,
  })
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
   * 내 북마크 목록 조회
   * @description
   * - 로그인한 사용자가 북마크한 코스 목록 조회
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 페이지네이션 요청
   * @returns CourseBookmarksResponse
   */
  @Get('me/bookmarks')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 북마크 목록 조회' })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지 크기',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CourseBookmarksResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getMyBookmarks(
    @UserId() userId: string,
    @Query() request: GetMyCoursesRequest,
  ): Promise<CourseBookmarksResponse> {
    const page = request.page ?? 1;
    const limit = request.limit ?? 20;
    const [bookmarks, total] = await this.courseBookmarkService.getMyBookmarks(
      userId,
      page,
      limit,
    );
    return CourseBookmarksResponse.from(bookmarks, total, page, limit);
  }

  /**
   * 내 좋아요 목록 조회
   * @description
   * - 로그인한 사용자가 좋아요한 코스 목록 조회
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 페이지네이션 요청
   * @returns CourseLikesResponse
   */
  @Get('me/likes')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 좋아요 목록 조회' })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지 크기',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CourseLikesResponse,
  })
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
   * 여행 코스 상세 조회
   * @description
   * - ID로 여행 코스 상세 정보 조회
   * - 좋아요/북마크 상태 포함
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   * @returns CourseResponse
   */
  @Get(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 상세 조회' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CourseResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async getCourseById(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<CourseResponse> {
    return this.travelCourseService.findByIdWithUserStatus(id, userId);
  }

  /**
   * 여행 코스 북마크 추가
   * @description
   * - 북마크 추가 (이미 존재하면 409 Conflict)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Post(':id/bookmark')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '여행 코스 북마크 추가' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 201, description: '북마크 추가 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 북마크한 코스' })
  async addBookmark(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.courseBookmarkService.addBookmark(userId, id);
  }

  /**
   * 여행 코스 북마크 삭제
   * @description
   * - 북마크 삭제 (멱등성 보장: 없어도 204 반환)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Delete(':id/bookmark')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '여행 코스 북마크 삭제' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: '북마크 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async removeBookmark(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.courseBookmarkService.removeBookmark(userId, id);
  }

  /**
   * 여행 코스 좋아요 추가
   * @description
   * - 좋아요 추가 (이미 존재하면 409 Conflict)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Post(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '여행 코스 좋아요 추가' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
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
   * @description
   * - 좋아요 삭제 (멱등성 보장: 없어도 204 반환)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Delete(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '여행 코스 좋아요 삭제' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
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
