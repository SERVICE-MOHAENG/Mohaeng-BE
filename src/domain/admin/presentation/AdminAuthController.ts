import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from '../service/AdminAuthService';
import { AdminLoginRequest } from './dto/request/AdminLoginRequest';
import { AdminRegisterRequest } from './dto/request/AdminRegisterRequest';
import { AdminRefreshTokenRequest } from './dto/request/AdminRefreshTokenRequest';
import { AdminAuthTokensResponse } from './dto/response/AdminAuthTokensResponse';
import { AdminRegisterResponse } from './dto/response/AdminRegisterResponse';
import { AdminMissingRefreshTokenException } from '../exception/AdminMissingRefreshTokenException';

/**
 * AdminAuthController
 * @description
 * - 관리자 인증 API (로그인, 가입, 토큰 갱신)
 */
@ApiTags('admin/auth')
@Controller('v1/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '관리자 계정 등록' })
  @ApiResponse({
    status: 201,
    description: '관리자 등록 성공',
    type: AdminRegisterResponse,
  })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일' })
  async register(
    @Body() request: AdminRegisterRequest,
  ): Promise<AdminRegisterResponse> {
    const admin = await this.adminAuthService.register(
      request.email,
      request.password,
      request.isSuperAdmin,
    );
    return AdminRegisterResponse.from(admin);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AdminAuthTokensResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() request: AdminLoginRequest,
  ): Promise<AdminAuthTokensResponse> {
    return this.adminAuthService.login(request.email, request.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '어드민 토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: AdminAuthTokensResponse,
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Body() request: AdminRefreshTokenRequest,
  ): Promise<AdminAuthTokensResponse> {
    if (!request.refreshToken || request.refreshToken.trim().length === 0) {
      throw new AdminMissingRefreshTokenException();
    }
    return this.adminAuthService.refreshTokens(request.refreshToken);
  }
}
