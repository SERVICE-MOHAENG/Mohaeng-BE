import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CurrentUser } from '../../../global/decorators/CurrentUser';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { AuthMissingRefreshTokenException } from '../exception/AuthMissingRefreshTokenException';
import { AuthService } from '../service/AuthService';
import { LoginRequest } from './dto/request/LoginRequest';
import { RefreshTokenRequest } from './dto/request/RefreshTokenRequest';
import { ExchangeAuthCodeRequest } from './dto/request/ExchangeAuthCodeRequest';
import { AuthTokensResponse } from './dto/response/AuthTokensResponse';
import { CurrentUserResponse } from './dto/response/CurrentUserResponse';
import { SendEmailOtpRequest } from './dto/request/SendEmailOtpRequest';
import { VerifyEmailOtpRequest } from './dto/request/VerifyEmailOtpRequest';
import { SignupRequest } from '../../user/presentation/dto/request/SignupRequest';
import { SendEmailOtpResponse } from './dto/response/SendEmailOtpResponse';
import { VerifyEmailOtpResponse } from './dto/response/VerifyEmailOtpResponse';
import { SignupResponse } from './dto/response/SignupResponse';
import { ResetPasswordRequest } from './dto/request/ResetPasswordRequest';
import { ResetPasswordResponse } from './dto/response/ResetPasswordResponse';
import { AuthEmailOtpPurpose } from './dto/request/AuthEmailOtpPurpose.enum';
import { GoogleAuthGuard } from '../guard/google-auth.guard';
import { NaverAuthGuard } from '../guard/naver-auth.guard';
import { KakaoAuthGuard } from '../guard/kakao-auth.guard';
import { GoogleAuthCallbackGuard } from '../guard/google-auth-callback.guard';
import { NaverAuthCallbackGuard } from '../guard/naver-auth-callback.guard';
import { KakaoAuthCallbackGuard } from '../guard/kakao-auth-callback.guard';
import {
  OAuthProviderName,
  redirectOAuthFailure,
  redirectOAuthSuccess,
} from '../oauth-redirect.util';
import { User } from '../../user/entity/User.entity';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 (유저 정보 + 토큰 반환)',
    type: SignupResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (이메일 중복 등)' })
  async signup(@Body() request: SignupRequest): Promise<SignupResponse> {
    return this.authService.signup(request);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthTokensResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() request: LoginRequest): Promise<AuthTokensResponse> {
    const tokens = await this.authService.login(request);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('email/otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증코드 발급' })
  @ApiResponse({
    status: 200,
    description: 'otp sent',
    type: SendEmailOtpResponse,
  })
  @ApiResponse({ status: 429, description: 'rate limited' })
  async sendEmailOtp(
    @Body() request: SendEmailOtpRequest,
  ): Promise<SendEmailOtpResponse> {
    return await this.authService.sendEmailOtp(
      request.email,
      request.purpose ?? AuthEmailOtpPurpose.SIGNUP,
    );
  }

  @Post('email/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증코드 검증' })
  @ApiResponse({
    status: 200,
    description: 'otp verified',
    type: VerifyEmailOtpResponse,
  })
  @ApiResponse({ status: 400, description: 'invalid otp' })
  async verifyEmailOtp(
    @Body() request: VerifyEmailOtpRequest,
  ): Promise<VerifyEmailOtpResponse> {
    const verified = await this.authService.verifyEmailOtp(
      request.email,
      request.otp,
      request.purpose ?? AuthEmailOtpPurpose.SIGNUP,
    );
    return { verified };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
    type: ResetPasswordResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 또는 인증 미완료' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async resetPassword(
    @Body() request: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    const reset = await this.authService.resetPassword(
      request.email,
      request.password,
      request.passwordConfirm,
    );
    return { reset };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: AuthTokensResponse,
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Body() request: RefreshTokenRequest,
  ): Promise<AuthTokensResponse> {
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
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CurrentUserResponse,
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  me(@CurrentUser() user: { id: string; email: string }): CurrentUserResponse {
    return user;
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 시작' })
  @ApiResponse({
    status: 302,
    description: 'Google 로그인 페이지로 리다이렉트',
  })
  async googleAuth(@Req() _req: Request) {
    void _req;
    // Guard가 자동으로 Google OAuth 페이지로 리다이렉트
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthCallbackGuard)
  @ApiOperation({ summary: 'Google 로그인 콜백' })
  @ApiResponse({
    status: 302,
    description: '인증 코드와 함께 프론트엔드로 리다이렉트',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async googleAuthRedirect(
    @Req() req: Request & { user?: User },
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(
      req.user,
      res,
      'google',
      'GOOGLE_FRONTEND_REDIRECT_URL',
    );
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth 인증 코드를 토큰으로 교환',
    description:
      '일회용 인증 코드를 액세스 토큰과 리프레시 토큰으로 교환합니다. 코드는 5분간 유효하며 1회만 사용 가능합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 교환 성공',
    type: AuthTokensResponse,
  })
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 코드' })
  async exchangeOAuthCode(
    @Body() request: ExchangeAuthCodeRequest,
  ): Promise<AuthTokensResponse> {
    const tokens = await this.authService.exchangeOAuthCode(request.code);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get('naver/login')
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: 'Naver 로그인 시작' })
  @ApiResponse({
    status: 302,
    description: 'Naver 로그인 페이지로 리다이렉트',
  })
  async naverAuth(@Req() _req: Request) {
    void _req;
    // Guard가 자동으로 Naver OAuth 페이지로 리다이렉트
  }

  @Get('naver/callback')
  @UseGuards(NaverAuthCallbackGuard)
  @ApiOperation({ summary: 'Naver 로그인 콜백' })
  @ApiResponse({
    status: 302,
    description: '인증 코드와 함께 프론트엔드로 리다이렉트',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async naverAuthRedirect(
    @Req() req: Request & { user?: User },
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(
      req.user,
      res,
      'naver',
      'NAVER_FRONTEND_REDIRECT_URL',
    );
  }

  @Get('kakao/login')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao 로그인 시작' })
  @ApiResponse({
    status: 302,
    description: 'Kakao 로그인 페이지로 리다이렉트',
  })
  async kakaoAuth(@Req() _req: Request) {
    void _req;
    // Guard가 자동으로 Kakao OAuth 페이지로 리다이렉트
  }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthCallbackGuard)
  @ApiOperation({ summary: 'Kakao 로그인 콜백' })
  @ApiResponse({
    status: 302,
    description: '인증 코드와 함께 프론트엔드로 리다이렉트',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async kakaoAuthRedirect(
    @Req() req: Request & { user?: User },
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(
      req.user,
      res,
      'kakao',
      'KAKAO_FRONTEND_REDIRECT_URL',
    );
  }

  private async handleOAuthCallback(
    user: User | undefined,
    response: Response,
    provider: OAuthProviderName,
    frontendRedirectUrlKey: string,
  ): Promise<void> {
    if (response.headersSent) {
      return;
    }

    const frontendRedirectUrl = this.getFrontendRedirectUrl(
      frontendRedirectUrlKey,
    );

    if (!user) {
      redirectOAuthFailure(response, frontendRedirectUrl, provider);
      return;
    }

    try {
      const code = await this.authService.generateOAuthCode(user);
      redirectOAuthSuccess(response, frontendRedirectUrl, code);
    } catch (error) {
      redirectOAuthFailure(response, frontendRedirectUrl, provider, error);
    }
  }

  private getFrontendRedirectUrl(configKey: string): string {
    const frontendRedirectUrl = this.configService.get<string>(configKey);

    if (!frontendRedirectUrl) {
      throw new Error(
        `${configKey} 환경 변수가 설정되지 않았습니다. .env 파일에 해당 값을 설정해주세요.`,
      );
    }

    return frontendRedirectUrl;
  }
}
