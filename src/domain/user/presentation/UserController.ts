import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UserService } from '../service/UserService';
import { UpdateProfileRequest } from './dto/request/UpdateProfileRequest';
import { UserResponse } from './dto/response/UserResponse';
import { GetMyPageContentRequest } from './dto/request/GetMyPageContentRequest';
import { MyPageSummaryResponse } from './dto/response/MyPageSummaryResponse';
import { UserMyPageSummaryService } from '../service/UserMyPageSummaryService';
import { UserMyPageContentService } from '../service/UserMyPageContentService';
import { MyPageLikedRegionsResponse } from './dto/response/MyPageLikedRegionsResponse';
import { CourseDetailListResponse } from '../../course/presentation/dto/response/CourseDetailListResponse';
import { CourseLikesResponse } from '../../course/presentation/dto/response/CourseLikesResponse';
import { BlogsResponse } from '../../blog/presentation/dto/response/BlogsResponse';
import { BlogLikesResponse } from '../../blog/presentation/dto/response/BlogLikesResponse';

/**
 * UserController
 * @description
 * - 사용자 관련 HTTP 요청 처리
 * - 회원가입, 사용자 정보 조회
 */
@ApiTags('users')
@Controller('v1/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMyPageSummaryService: UserMyPageSummaryService,
    private readonly userMyPageContentService: UserMyPageContentService,
  ) {}

  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 상단 요약 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '프로필과 상단 통계 조회 성공',
    type: MyPageSummaryResponse,
  })
  async getMyPageSummary(
    @UserId() userId: string,
  ): Promise<MyPageSummaryResponse> {
    return this.userMyPageSummaryService.getSummary(userId);
  }

  @Get('me/roadmaps')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 내 여행 일정 조회' })
  @ApiResponse({
    status: 200,
    description: '내 여행 일정 조회 성공',
    type: CourseDetailListResponse,
  })
  async getMyRoadmaps(
    @UserId() userId: string,
    @Query() request: GetMyPageContentRequest,
  ): Promise<CourseDetailListResponse> {
    return this.userMyPageContentService.getMyRoadmaps(
      userId,
      request.page,
      request.limit,
    );
  }

  @Get('me/blogs')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 여행 기록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 여행 기록 조회 성공',
    type: BlogsResponse,
  })
  async getMyBlogs(
    @UserId() userId: string,
    @Query() request: GetMyPageContentRequest,
  ): Promise<BlogsResponse> {
    return this.userMyPageContentService.getMyBlogs(
      userId,
      request.page,
      request.limit,
    );
  }

  @Get('me/liked-roadmaps')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 좋아요한 여행 일정 조회' })
  @ApiResponse({
    status: 200,
    description: '좋아요한 여행 일정 조회 성공',
    type: CourseLikesResponse,
  })
  async getLikedRoadmaps(
    @UserId() userId: string,
    @Query() request: GetMyPageContentRequest,
  ): Promise<CourseLikesResponse> {
    return this.userMyPageContentService.getLikedRoadmaps(
      userId,
      request.page,
      request.limit,
    );
  }

  @Get('me/liked-blogs')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 좋아요한 블로그 조회' })
  @ApiResponse({
    status: 200,
    description: '좋아요한 블로그 조회 성공',
    type: BlogLikesResponse,
  })
  async getLikedBlogs(
    @UserId() userId: string,
    @Query() request: GetMyPageContentRequest,
  ): Promise<BlogLikesResponse> {
    return this.userMyPageContentService.getLikedBlogs(
      userId,
      request.page,
      request.limit,
    );
  }

  @Get('me/liked-regions')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 좋아요한 여행지 조회' })
  @ApiResponse({
    status: 200,
    description: '좋아요한 여행지 조회 성공',
    type: MyPageLikedRegionsResponse,
  })
  async getLikedRegions(
    @UserId() userId: string,
    @Query() request: GetMyPageContentRequest,
  ): Promise<MyPageLikedRegionsResponse> {
    return this.userMyPageContentService.getLikedRegions(
      userId,
      request.page,
      request.limit,
    );
  }

  @Patch('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '정보 수정 성공',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async updateProfile(
    @UserId() userId: string,
    @Body() request: UpdateProfileRequest,
  ): Promise<UserResponse> {
    return this.userService.updateProfile(userId, request);
  }

  @Delete('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 204, description: '탈퇴 성공' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@UserId() userId: string): Promise<void> {
    await this.userService.deactivate(userId);
  }
}
