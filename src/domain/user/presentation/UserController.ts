import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UserService } from '../service/UserService';
import { UpdateProfileRequest } from './dto/request/UpdateProfileRequest';
import { UserResponse } from './dto/response/UserResponse';
import { MainpageResponse } from './dto/response/MainPageResponse';
import { UserLikeService } from '../service/UserLikeService';
import { GetMyLikesOverviewRequest } from './dto/request/GetMyLikesOverviewRequest';
import { MyLikesResponse } from './dto/response/MyLikesResponse';

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
    private readonly userLikeService: UserLikeService,
  ) {}

  @Get('me/likes')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '마이페이지 통합 찜 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '좋아요한 로드맵, 블로그, 지역 조회 성공',
    type: MyLikesResponse,
  })
  async getMyLikes(
    @UserId() userId: string,
    @Query() request: GetMyLikesOverviewRequest,
  ): Promise<MyLikesResponse> {
    return this.userLikeService.getMyLikesOverview(userId, request.limit);
  }

  @Get('mainpage/me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '메인페이지 유저 정보' })
  @ApiResponse({
    status: 200,
    description: '유저 정보 전송',
    type: UserResponse,
  })
  async getUser(@UserId() userId: string): Promise<MainpageResponse> {
    return this.userService.getMainpageUser(userId);
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
