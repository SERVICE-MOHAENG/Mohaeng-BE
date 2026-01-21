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
import { CourseBookmarkService } from '../service/CourseBookmarkService';
import { CourseLikeService } from '../service/CourseLikeService';
import { CreateCourseRequest } from './dto/request/CreateCourseRequest';
import { UpdateCourseRequest } from './dto/request/UpdateCourseRequest';
import { GetMyCoursesRequest } from './dto/request/GetMyCoursesRequest';
import { GetCoursesRequest } from './dto/request/GetCoursesRequest';
import { CourseResponse } from './dto/response/CourseResponse';
import { CoursesResponse } from './dto/response/CoursesResponse';
import { BookmarkToggleResponse } from './dto/response/BookmarkToggleResponse';
import { LikeToggleResponse } from './dto/response/LikeToggleResponse';
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
   * 여행 코스 생성
   * @description
   * - 새로운 여행 코스 생성
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 코스 생성 요청
   * @returns CourseResponse
   */
  @Post()
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 생성' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: CourseResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createCourse(
    @UserId() userId: string,
    @Body() request: CreateCourseRequest,
  ): Promise<CourseResponse> {
    return this.travelCourseService.createCourse(userId, request);
  }

  /**
   * 여행 코스 상세 조회
   * @description
   * - ID로 여행 코스 상세 정보 조회
   * @param id - 코스 ID
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
  async getCourseById(@Param('id') id: string): Promise<CourseResponse> {
    const course = await this.travelCourseService.findById(id);
    return CourseResponse.fromEntity(course);
  }

  /**
   * 여행 코스 수정
   * @description
   * - 여행 코스 정보 수정 (소유자만 가능)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 코스 수정 요청
   * @returns CourseResponse
   */
  @Patch(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 수정' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: CourseResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async updateCourse(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() request: UpdateCourseRequest,
  ): Promise<CourseResponse> {
    return this.travelCourseService.updateCourse(id, userId, request);
  }

  /**
   * 여행 코스 삭제
   * @description
   * - 여행 코스 삭제 (소유자만 가능)
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   * @returns void (204 No Content)
   */
  @Delete(':id')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '여행 코스 삭제' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async deleteCourse(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.travelCourseService.deleteCourse(id, userId);
  }

  /**
   * 여행 코스 북마크 토글
   * @description
   * - 북마크 추가/취소
   * - 북마크가 있으면 삭제, 없으면 추가
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   * @returns BookmarkToggleResponse
   */
  @Post(':id/bookmark')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 북마크 토글' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '북마크 토글 성공',
    type: BookmarkToggleResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async toggleBookmark(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<BookmarkToggleResponse> {
    const result = await this.courseBookmarkService.toggleBookmark(userId, id);
    return BookmarkToggleResponse.of(result.bookmarked);
  }

  /**
   * 여행 코스 좋아요 토글
   * @description
   * - 좋아요 추가/취소
   * - 좋아요가 있으면 삭제, 없으면 추가
   * @param id - 코스 ID
   * @param userId - 사용자 ID (자동 주입)
   * @returns LikeToggleResponse
   */
  @Post(':id/like')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '여행 코스 좋아요 토글' })
  @ApiParam({
    name: 'id',
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 토글 성공',
    type: LikeToggleResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없음' })
  async toggleLike(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<LikeToggleResponse> {
    const result = await this.courseLikeService.toggleLike(userId, id);
    return LikeToggleResponse.of(result.liked);
  }
}
