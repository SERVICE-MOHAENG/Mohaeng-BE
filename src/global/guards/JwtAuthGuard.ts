import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode } from '../exception/code';

type JwtPayload = {
  sub: string;
  email: string;
};

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.MISSING_TOKEN,
          '토큰이 필요합니다.',
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET is not set.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      request.user = payload;
      return true;
    } catch {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_TOKEN,
          '유효하지 않은 토큰입니다.',
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
