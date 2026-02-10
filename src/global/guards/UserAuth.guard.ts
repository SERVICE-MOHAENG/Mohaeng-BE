import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRepository } from '../../domain/user/persistence/UserRepository';
import { GlobalInvalidTokenException } from '../exception/GlobalInvalidTokenException';
import { GlobalMissingTokenException } from '../exception/GlobalMissingTokenException';
import { GlobalUnauthorizedException } from '../exception/GlobalUnauthorizedException';
import { GlobalDatabaseErrorException } from '../exception/GlobalDatabaseErrorException';
import { GlobalJwtService } from '../jwt/GlobalJwtService';

type AuthenticatedUser = {
  id: string;
  email: string;
};

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly globalJwtService: GlobalJwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    // Authorization 헤더 누락 체크
    if (!authHeader) {
      throw new GlobalMissingTokenException();
    }
    const token = this.extractBearerToken(authHeader);
    // Bearer 형식 검증
    if (!token) {
      throw new GlobalInvalidTokenException();
    }

    try {
      // Validate token and ensure user exists
      // 토큰 검증 및 사용자 존재 확인
      const payload = this.globalJwtService.verifyUserToken(token);

      // DB 조회 중 발생하는 에러를 별도로 처리
      let user;
      try {
        user = await this.userRepository.findById(payload.userId);
      } catch (dbError) {
        // 데이터베이스 연결 실패 등의 서버 에러는 500으로 처리
        throw new GlobalDatabaseErrorException();
      }

      // 비활성/미존재 사용자 차단
      if (!user || !user.isActivate) {
        throw new GlobalUnauthorizedException();
      }

      // 인증된 사용자 정보 주입
      request.user = this.toAuthenticatedUser(user.id, user.email);
      return true;
    } catch (error) {
      // DB 에러와 인증 에러는 그대로 전파
      if (
        error instanceof GlobalDatabaseErrorException ||
        error instanceof GlobalUnauthorizedException
      ) {
        throw error;
      }
      // JWT 검증 실패 등은 401로 처리
      throw new GlobalInvalidTokenException();
    }
  }

  private extractBearerToken(authHeader: string): string | undefined {
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private toAuthenticatedUser(
    userId: string,
    email: string,
  ): AuthenticatedUser {
    return {
      id: userId,
      email,
    };
  }
}
