import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import ms = require('ms');
import type { StringValue } from 'ms';
import { User } from '../../user/entity/User.entity';
import { Provider } from '../../user/entity/Provider.enum';
import { UserNotActiveException } from '../../user/exception/UserNotActiveException';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { UserService } from '../../user/service/UserService';
import { UserRepository } from '../../user/persistence/UserRepository';
import { RefreshToken } from '../entity/RefreshToken.entity';
import { AuthInvalidCredentialsException } from '../exception/AuthInvalidCredentialsException';
import { AuthInvalidRefreshTokenException } from '../exception/AuthInvalidRefreshTokenException';
import { AuthEmailAlreadyRegisteredWithDifferentProviderException } from '../exception/AuthEmailAlreadyRegisteredWithDifferentProviderException';
import { LoginRequest } from '../presentation/dto/request/LoginRequest';
import { RefreshTokenRepository } from '../persistence/RefreshTokenRepository';
import { GlobalJwtService } from '../../../global/jwt/GlobalJwtService';

type JwtPayload = {
  sub: string;
  email: string;
  userId: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly globalJwtService: GlobalJwtService,
  ) {}

  async login(request: LoginRequest): Promise<AuthTokens> {
    // 이메일로 사용자 조회
    let user: User;
    try {
      user = await this.userService.findByEmail(request.email);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new AuthInvalidCredentialsException();
      }
      throw error;
    }

    if (!user.passwordHash) {
      throw new AuthInvalidCredentialsException();
    }

    // 비활성 계정 차단
    if (!user.isActivate) {
      throw new UserNotActiveException();
    }

    // 비밀번호 검증
    const isValid = await this.userService.verifyPassword(
      request.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new AuthInvalidCredentialsException();
    }

    return this.issueTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // 리프레시 토큰 해시 조회
    const tokenHash = this.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new AuthInvalidRefreshTokenException();
    }

    // 비활성 토큰 재사용 감지 시 전체 토큰 폐기
    if (!storedToken.isActive()) {
      await this.revokeAllUserTokens(storedToken.user.id);
      throw new AuthInvalidRefreshTokenException();
    }

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not set.');
    }

    // 리프레시 토큰 JWT 검증
    try {
      await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      // 유효하지 않은 토큰은 즉시 폐기
      storedToken.revoke();
      await this.refreshTokenRepository.save(storedToken);
      throw new AuthInvalidRefreshTokenException();
    }

    // 리프레시 토큰 회전 처리
    storedToken.rotate();
    await this.refreshTokenRepository.save(storedToken);

    return this.issueTokens(storedToken.user);
  }

  async issueTokens(user: User): Promise<AuthTokens> {
    // Access/Refresh 토큰 공용 페이로드 구성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userId: user.id,
    };
    // Access 토큰 발급
    const accessToken = this.globalJwtService.signUserToken({
      userId: user.id,
      email: user.email,
      sub: user.id,
    });

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not set.');
    }

    const refreshExpiresIn = this.getRefreshExpiresIn();
    // Refresh 토큰 발급
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const expiresAt = this.getRefreshExpiresAt(refreshExpiresIn);
    // Refresh 토큰 해시 저장
    const refreshTokenEntity = RefreshToken.create(
      user,
      this.hashToken(refreshToken),
      expiresAt,
    );
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  private getRefreshExpiresIn(): StringValue {
    return (this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ||
      '7d') as StringValue;
  }

  private getRefreshExpiresAt(expiresIn: StringValue): Date {
    const expiresInMs = ms(expiresIn);
    if (typeof expiresInMs !== 'number') {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(Date.now() + expiresInMs);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllActiveByUserId(userId);
  }

  /**
   * Google OAuth 사용자 검증 및 생성/조회
   * @param googleUser - Google 사용자 정보
   * @returns User 엔티티
   */
  async validateGoogleUser(googleUser: {
    providerId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    // 이메일로 기존 사용자 조회
    let user = await this.userRepository.findByEmail(googleUser.email);

    //기존 사용자 존재시
    if (user) {
      // 기존 사용자가 있지만 provider가 다른 경우
      if (user.provider !== Provider.GOOGLE) {
        throw new AuthEmailAlreadyRegisteredWithDifferentProviderException(
          user.provider,
        );
      }

      // 비활성 사용자 체크
      if (!user.isActivate) {
        throw new UserNotActiveException();
      }

      return user;
    }

    // 신규 사용자 생성
    user = User.createWithOAuth(
      googleUser.name,
      googleUser.email,
      Provider.GOOGLE,
      googleUser.providerId,
    );

    return await this.userRepository.save(user);
  }
}
