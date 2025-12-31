import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import { createHash } from 'crypto';
import ms = require('ms');
import type { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { GlobalErrorCode } from '../../../global/exception/code';
import { RefreshToken } from '../../user/entity/RefreshToken.entity';
import { RefreshTokenStatus } from '../../user/entity/RefreshTokenStatus.enum';
import { User } from '../../user/entity/User.entity';
import { LoginRequest } from '../../user/presentation/dto/request/LoginRequest';
import { SignupRequest } from '../../user/presentation/dto/request/SignupRequest';
import { UserService } from '../../user/service/UserService';

type JwtPayload = {
  sub: string;
  email: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(request: SignupRequest): Promise<void> {
    this.validateSignupRequest(request);

    const sameUser = await this.userRepository.findOne({
      where: { email: request.email },
    });
    if (sameUser) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_REQUEST,
          '이미 사용 중인 이메일입니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.userService.hashPassword(
      request.password,
    );
    const user = User.create(request.name, request.email, hashedPassword);
    await this.userRepository.save(user);
  }

  async login(request: LoginRequest): Promise<AuthTokens> {
    const user = await this.userRepository.findOne({
      where: { email: request.email },
    });

    if (!user || !user.password) {
      throw this.createUnauthorizedException();
    }

    const isValid = await this.userService.verifyPassword(
      request.password,
      user.password,
    );
    if (!isValid) {
      throw this.createUnauthorizedException();
    }

    return this.issueTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!storedToken) {
      throw this.createInvalidTokenException();
    }

    if (!storedToken.isActive()) {
      await this.revokeAllUserTokens(storedToken.user.id);
      throw this.createInvalidTokenException(
        '이미 사용된 Refresh Token입니다. 다시 로그인 해주세요.',
      );
    }

    const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not set.');
    }

    try {
      await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      storedToken.revoke();
      await this.refreshTokenRepository.save(storedToken);
      throw this.createInvalidTokenException(
        '유효하지 않은 Refresh Token입니다.',
      );
    }

    storedToken.rotate();
    await this.refreshTokenRepository.save(storedToken);

    return this.issueTokens(storedToken.user);
  }

  private validateSignupRequest(request: SignupRequest): void {
    if (!request.name || request.name.length < 1 || request.name.length > 20) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_REQUEST,
          '이름은 1자 이상 20자 이하여야 합니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.email || !isEmail(request.email)) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_REQUEST,
          '올바른 이메일 형식이 아닙니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.password || request.password.length < 8) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_REQUEST,
          '비밀번호는 최소 8자 이상이어야 합니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (request.password !== request.passwordConfirm) {
      throw new HttpException(
        ApiResponseDto.error(
          GlobalErrorCode.INVALID_REQUEST,
          '비밀번호가 일치하지 않습니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private createUnauthorizedException(): HttpException {
    return new HttpException(
      ApiResponseDto.error(
        GlobalErrorCode.UNAUTHORIZED,
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }

  private createInvalidTokenException(message?: string): HttpException {
    return new HttpException(
      ApiResponseDto.error(
        GlobalErrorCode.INVALID_TOKEN,
        message || '유효하지 않은 토큰입니다.',
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not set.');
    }

    const refreshExpiresIn = this.getRefreshExpiresIn();
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const expiresAt = this.getRefreshExpiresAt(refreshExpiresIn);
    const refreshTokenEntity = RefreshToken.create(
      user,
      this.hashToken(refreshToken),
      expiresAt,
    );
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  private getRefreshExpiresIn(): StringValue {
    return (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d') as StringValue;
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
    await this.refreshTokenRepository.update(
      { user: { id: userId }, status: RefreshTokenStatus.ACTIVE },
      { status: RefreshTokenStatus.REVOKED, revokedAt: new Date() },
    );
  }
}
