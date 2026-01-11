import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { User } from '../../user/entity/User.entity';
import { Provider } from '../../user/entity/Provider.enum';
import { UserNotActiveException } from '../../user/exception/UserNotActiveException';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { UserService } from '../../user/service/UserService';
import { UserRepository } from '../../user/persistence/UserRepository';
import { EmailAlreadyExistsException } from '../../user/exception/EmailAlreadyExistsException';
import { AuthInvalidCredentialsException } from '../exception/AuthInvalidCredentialsException';
import { AuthInvalidRefreshTokenException } from '../exception/AuthInvalidRefreshTokenException';
import { AuthInvalidOAuthCodeException } from '../exception/AuthInvalidOAuthCodeException';
import { AuthEmailAlreadyRegisteredWithDifferentProviderException } from '../exception/AuthEmailAlreadyRegisteredWithDifferentProviderException';
import { AuthEmailOtpCooldownException } from '../exception/AuthEmailOtpCooldownException';
import { AuthEmailOtpTooManyRequestsException } from '../exception/AuthEmailOtpTooManyRequestsException';
import { AuthInvalidEmailOtpException } from '../exception/AuthInvalidEmailOtpException';
import { AuthEmailOtpMaxAttemptsExceededException } from '../exception/AuthEmailOtpMaxAttemptsExceededException';
import { LoginRequest } from '../presentation/dto/request/LoginRequest';
import { OAuthCodeRepository } from '../persistence/OAuthCodeRepository';
import { GlobalJwtService } from '../../../global/jwt/GlobalJwtService';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';
import { EmailOtpService } from './EmailOtpService';


type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const OTP_TTL_SECONDS = 5 * 60;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const OTP_RATE_LIMIT_MAX = 5;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_VERIFIED_FLAG_TTL_SECONDS = 10 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7일

@Injectable()
export class AuthService {
  constructor(
    private readonly oauthCodeRepository: OAuthCodeRepository,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly globalJwtService: GlobalJwtService,
    private readonly emailOtpService: EmailOtpService,
    private readonly redisService: GlobalRedisService,
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

  async sendEmailOtp(email: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);

    // 이메일 중복 확인 (이미 가입된 이메일은 OTP 발송 차단)
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const otpKey = this.getOtpKey(normalizedEmail);
    const cooldownKey = this.getOtpCooldownKey(normalizedEmail);
    const rateLimitKey = this.getOtpRateLimitKey(normalizedEmail);
    const attemptsKey = this.getOtpAttemptsKey(normalizedEmail);

    // 쿨다운 중이면 재발송 차단
    const isCooldownActive = await this.redisService.exists(cooldownKey);
    if (isCooldownActive) {
      throw new AuthEmailOtpCooldownException();
    }

    // 발송 횟수 제한 체크
    const currentCount = await this.redisService.get(rateLimitKey);
    if (currentCount && Number(currentCount) >= OTP_RATE_LIMIT_MAX) {
      throw new AuthEmailOtpTooManyRequestsException();
    }

    const otp = this.generateOtp();
    // OTP 이메일 발송
    await this.emailOtpService.sendOtp(normalizedEmail, otp);

    // 새 OTP 발송 시 기존 시도 횟수 초기화
    await this.redisService.delete(attemptsKey);

    //OTP 저장
    await this.redisService.setWithExpiry(otpKey, otp, OTP_TTL_SECONDS);

    //쿨다운 플래그 저장
    await this.redisService.setWithExpiry(
      cooldownKey,
      '1',
      OTP_COOLDOWN_SECONDS,
    );

    // 발송 횟수 증가 및 윈도우 설정
    const nextCount = await this.redisService.increment(rateLimitKey);
    if (nextCount === 1) {
      await this.redisService.expire(
        rateLimitKey,
        OTP_RATE_LIMIT_WINDOW_SECONDS,
      );
    }

    return true;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const otpKey = this.getOtpKey(normalizedEmail);
    const attemptsKey = this.getOtpAttemptsKey(normalizedEmail);
    const verifiedKey = this.getOtpVerifiedKey(normalizedEmail);

    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp) {
      throw new AuthInvalidEmailOtpException();
    }

    // 시도 횟수 확인
    const currentAttempts = await this.redisService.get(attemptsKey);
    const attempts = currentAttempts ? Number(currentAttempts) : 0;

    if (attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      throw new AuthEmailOtpMaxAttemptsExceededException();
    }

    // OTP 검증
    if (storedOtp !== otp) {
      // 실패 시 시도 횟수 증가
      const newAttempts = await this.redisService.increment(attemptsKey);
      if (newAttempts === 1) {
        // 첫 시도일 경우 만료 시간 설정 (OTP와 동일한 TTL)
        await this.redisService.expire(attemptsKey, OTP_TTL_SECONDS);
      }
      throw new AuthInvalidEmailOtpException();
    }

    // 검증 성공 시 OTP 및 시도 횟수 삭제
    await this.redisService.delete(otpKey);
    await this.redisService.delete(attemptsKey);

    // 인증 완료 플래그 저장 (10분)
    await this.redisService.setWithExpiry(
      verifiedKey,
      '1',
      OTP_VERIFIED_FLAG_TTL_SECONDS,
    );

    return true;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // 1. JWT 검증 및 디코딩
    let payload: { userId: string; jti: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new AuthInvalidRefreshTokenException();
    }

    const { userId, jti } = payload;
    const tokenHash = this.hashToken(refreshToken);

    // 2. Redis에 저장된 토큰 데이터 확인 (jti 기반)
    const tokenKey = `refresh:user:${userId}:${jti}`;
    const storedData = await this.redisService.get(tokenKey);

    if (!storedData) {
      // 토큰이 없음 → 해당 사용자의 모든 토큰 삭제 (보안 조치)
      await this.revokeAllUserTokens(userId);
      throw new AuthInvalidRefreshTokenException();
    }

    // 3. 토큰 해시 비교
    const [storedHash] = storedData.split(':');
    if (storedHash !== tokenHash) {
      // 토큰 불일치 → 해당 사용자의 모든 토큰 삭제 (보안 조치)
      await this.revokeAllUserTokens(userId);
      throw new AuthInvalidRefreshTokenException();
    }

    // 4. 사용자 조회 및 검증
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isActivate) {
      throw new UserNotActiveException();
    }

    // 5. 같은 jti로 새 토큰 발급 (같은 디바이스 슬롯 유지, LRU 구현)
    return this.issueTokens(user, jti);
  }

  async issueTokens(user: User, existingJti?: string): Promise<AuthTokens> {
    let jti: string;

    if (existingJti) {
      // Refresh 요청: 기존 jti 재사용 (같은 디바이스 슬롯 유지)
      jti = existingJti;

      // 기존 토큰 삭제 (덮어쓰기)
      const oldKey = `refresh:user:${user.id}:${existingJti}`;
      await this.redisService.delete(oldKey);
    } else {
      // 신규 로그인: LRU 처리
      const pattern = `refresh:user:${user.id}:*`;
      const existingKeys = await this.redisService.keys(pattern);

      // 3개 이상이면 가장 오래된 토큰 삭제
      if (existingKeys.length >= 3) {
        const tokensWithTime: Array<{ key: string; createdAt: number }> = [];

        for (const key of existingKeys) {
          const data = await this.redisService.get(key);
          if (data) {
            const [, createdAtStr] = data.split(':');
            tokensWithTime.push({
              key,
              createdAt: Number(createdAtStr),
            });
          }
        }
        // createdAt 기준 오름차순 정렬 (가장 오래된 것이 앞에)
        tokensWithTime.sort((a, b) => a.createdAt - b.createdAt);

        // 가장 오래된 토큰 삭제 (3개 -> 2개로 만들기)
        const oldestToken = tokensWithTime[0];
        await this.redisService.delete(oldestToken.key);
      }

      // 새 jti 생성
      jti = randomBytes(16).toString('hex');
    }

    // Access 토큰 발급 (JWT)
    const accessToken = this.globalJwtService.signUserToken({
      userId: user.id,
      email: user.email,
      sub: user.id,
    });

    // Refresh 토큰 발급 (JWT)
    const refreshTokenPayload = {
      userId: user.id,
      jti: jti,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const tokenHash = this.hashToken(refreshToken);
    const createdAt = Date.now();

    // 새 Refresh 토큰을 Redis에 저장 (jti 기반, LRU 구현)
    const tokenKey = `refresh:user:${user.id}:${jti}`;
    await this.redisService.setWithExpiry(
      tokenKey,
      `${tokenHash}:${createdAt}`,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }


  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getOtpKey(email: string): string {
    return `auth:email-otp:${email}`;
  }

  private getOtpCooldownKey(email: string): string {
    return `auth:email-otp:cooldown:${email}`;
  }

  private getOtpRateLimitKey(email: string): string {
    return `auth:email-otp:limit:${email}`;
  }

  private getOtpAttemptsKey(email: string): string {
    return `auth:email-otp:attempts:${email}`;
  }

  private getOtpVerifiedKey(email: string): string {
    return `auth:email-verified:${email}`;
  }

  private generateOtp(): string {
    const value = randomInt(0, 1000000);
    return value.toString().padStart(6, '0');
  }


  /**
   * 사용자의 모든 리프레시 토큰 삭제 (강제 로그아웃)
   * @param userId - 사용자 ID
   */
  private async revokeAllUserTokens(userId: string): Promise<void> {
    // 해당 사용자의 모든 토큰 삭제
    await this.redisService.deletePattern(`refresh:user:${userId}:*`);
  }

  /**
   * OAuth 사용자 검증 및 생성/조회 공통 로직
   * @param provider - OAuth 제공자 (GOOGLE, NAVER 등)
   * @param oauthUser - OAuth 사용자 정보
   * @returns User 엔티티
   */
  private async validateOAuthUser(
    provider: Provider,
    oauthUser: {
      providerId: string;
      email: string;
      name: string;
      picture?: string;
    },
  ): Promise<User> {
    // 1순위: providerId로 기존 사용자 조회 (가장 정확한 방법)
    let user = await this.userRepository.findByProviderAndProviderId(
      provider,
      oauthUser.providerId,
    );

    if (user) {
      // 비활성 사용자 체크
      if (!user.isActivate) {
        throw new UserNotActiveException();
      }

      return user;
    }

    // 2순위: 이메일로 기존 사용자 조회 (폴백)
    user = await this.userRepository.findByEmail(oauthUser.email);

    if (user) {
      // 기존 사용자가 있지만 provider가 다른 경우
      if (user.provider !== provider) {
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
      oauthUser.name,
      oauthUser.email,
      provider,
      oauthUser.providerId,
    );

    return await this.userRepository.save(user);
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
    return this.validateOAuthUser(Provider.GOOGLE, googleUser);
  }

  /**
   * OAuth 인증 코드를 생성하고 저장합니다
   * @param user 사용자 엔티티
   * @returns 생성된 인증 코드
   */
  async generateOAuthCode(user: User): Promise<string> {
    const code = this.oauthCodeRepository.generateCode();
    await this.oauthCodeRepository.save(code, {
      userId: user.id,
      email: user.email,
    });
    return code;
  }

  /**
   * OAuth 인증 코드를 토큰으로 교환합니다
   * @param code 인증 코드
   * @returns 액세스 토큰과 리프레시 토큰
   */
  async exchangeOAuthCode(code: string): Promise<AuthTokens> {
    // 인증 코드 조회 및 삭제 (일회용)
    const codeData = await this.oauthCodeRepository.findAndDelete(code);

    if (!codeData) {
      throw new AuthInvalidOAuthCodeException();
    }

    // 사용자 조회
    const user = await this.userRepository.findById(codeData.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    // 비활성 사용자 체크
    if (!user.isActivate) {
      throw new UserNotActiveException();
    }

    // 토큰 발급
    return this.issueTokens(user);
  }

  /**
   * Naver OAuth 사용자 검증 및 생성/조회
   * @param naverUser - Naver 사용자 정보
   * @returns User 엔티티
   */
  async validateNaverUser(naverUser: {
    providerId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    return this.validateOAuthUser(Provider.NAVER, naverUser);
  }

  /**
   * Kakao OAuth 사용자 검증 및 생성/조회
   * @param kakaoUser - Kakao 사용자 정보
   * @returns User 엔티티
   */
  async validateKakaoUser(kakaoUser: {
    providerId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    return this.validateOAuthUser(Provider.KAKAO, kakaoUser);
  }
}
