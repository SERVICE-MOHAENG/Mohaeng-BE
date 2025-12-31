import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import ms = require('ms');
import type { StringValue } from 'ms';
import { LoginRequest } from '../../user/presentation/dto/request/LoginRequest';
import { SignupRequest } from '../../user/presentation/dto/request/SignupRequest';
import { JwtAuthGuard } from '../../../global/guards/JwtAuthGuard';
import { AuthService } from '../service/AuthService';
import { RefreshTokenRequest } from './dto/request/RefreshTokenRequest';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async signup(@Body() request: SignupRequest) {
    await this.authService.signup(request);
    return { message: '회원가입이 완료되었습니다.' };
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(request);
    this.setAccessTokenCookie(response, tokens.accessToken);
    return tokens;
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiResponse({ status: 200, description: '재발급 성공' })
  async refresh(
    @Body() request: RefreshTokenRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.refreshTokens(request.refreshToken);
    this.setAccessTokenCookie(response, tokens.accessToken);
    return tokens;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '내 정보 확인' })
  @ApiResponse({ status: 200, description: '확인 성공' })
  async me(@Req() request: Request) {
    const user = (request as Request & { user?: unknown }).user;
    return { user };
  }

  private setAccessTokenCookie(
    response: Response,
    accessToken: string,
  ): void {
    const expiresIn = (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ||
      '1h') as StringValue;
    const maxAge = ms(expiresIn);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: typeof maxAge === 'number' ? maxAge : undefined,
    });
  }
}
