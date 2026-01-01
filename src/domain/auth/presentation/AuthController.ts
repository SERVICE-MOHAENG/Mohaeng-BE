import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../../../global/decorators/CurrentUser';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { AuthMissingRefreshTokenException } from '../exception/AuthMissingRefreshTokenException';
import { AuthService } from '../service/AuthService';
import { LoginRequest } from './dto/request/LoginRequest';
import { RefreshTokenRequest } from './dto/request/RefreshTokenRequest';
import { AuthTokensResponse } from './dto/response/AuthTokensResponse';
import { CurrentUserResponse } from './dto/response/CurrentUserResponse';
import { GoogleAuthGuard } from '../guard/google-auth.guard';
import { User } from '../../user/entity/User.entity';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthTokensResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() request: LoginRequest): Promise<AuthTokensResponse> {
    const tokens = await this.authService.login(request);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: AuthTokensResponse })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(@Body() request: RefreshTokenRequest): Promise<AuthTokensResponse> {
    if (!request.refreshToken || request.refreshToken.trim().length === 0) {
      throw new AuthMissingRefreshTokenException();
    }

    const tokens = await this.authService.refreshTokens(request.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: CurrentUserResponse })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async me(@CurrentUser() user: { id: string; email: string }): Promise<CurrentUserResponse> {
    return user;
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Google 로그인 페이지로 리다이렉트' })
  async googleAuth(@Req() req: Request) {
    // Guard가 자동으로 Google OAuth 페이지로 리다이렉트
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 콜백' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthTokensResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async googleAuthRedirect(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ): Promise<void> {
    // Google OAuth 성공 후 토큰 발급
    const tokens = await this.authService.issueTokens(req.user);

    // TODO: [보안] 현재 URL 파라미터로 토큰 전달 - 프로덕션 배포 전 개선 필요
    // 보안 위험:
    // - 브라우저 히스토리에 토큰 노출
    // - 서버 로그에 토큰 기록 가능
    // - Referrer 헤더를 통한 토큰 유출 가능
    //
    // 권장 개선 방안 (일회용 코드 교환 방식):
    // 1. 임시 코드 생성 및 Redis/메모리 캐시에 저장 (유효기간: 5분)
    // 2. 프론트엔드로 코드만 전달: `${frontendUrl}/auth/google/callback?code=${tempCode}`
    // 3. 프론트엔드에서 POST /v1/auth/google/exchange API로 코드를 토큰으로 교환 => url에 코드가 노출되지만 일회성이고 토큰이 아니여서 비교적 안전
    // 4. 코드는 1회용으로 사용 후 즉시 삭제
    //
    // 참고: OAuth 콜백은 브라우저 리다이렉트(GET)이므로 JSON 응답 불가
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/google/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
