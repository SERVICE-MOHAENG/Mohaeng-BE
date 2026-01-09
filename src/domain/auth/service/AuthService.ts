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

type JwtPayload = {
  sub: string;
  email: string;
  userId: string;
};

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

    return this.issueTokens(user, request.deviceId);
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

    const isCooldownActive = await this.redisService.exists(cooldownKey);
    if (isCooldownActive) {
      throw new AuthEmailOtpCooldownException();
    }

    const currentCount = await this.redisService.get(rateLimitKey);
    if (currentCount && Number(currentCount) >= OTP_RATE_LIMIT_MAX) {
      throw new AuthEmailOtpTooManyRequestsException();
    }

    const otp = this.generateOtp();
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
    const tokenHash = this.hashToken(refreshToken);

    // 1. 블랙리스트 체크 (재사용 감지)
    const isUsed = await this.redisService.get(`refresh:used:${tokenHash}`);
    if (isUsed) {
      // 재사용 공격 감지! 사용자의 모든 토큰 폐기
      const userId = isUsed;
      await this.revokeAllUserTokens(userId);
      throw new AuthInvalidRefreshTokenException();
    }

    // 2. 화이트리스트 체크
    const data = await this.redisService.get(`refresh:valid:${tokenHash}`);
    if (!data) {
      // 토큰이 없음 → 만료되었거나 이미 사용됨
      throw new AuthInvalidRefreshTokenException();
    }

    const { userId, deviceId } = JSON.parse(data);

    // 3. 토큰 회전 처리 (RTR)
    // 화이트리스트에서 제거
    await this.redisService.delete(`refresh:valid:${tokenHash}`);

    // 디바이스 매핑도 삭제
    await this.redisService.delete(`refresh:device:${userId}:${deviceId}`);

    // 블랙리스트에 추가 (재사용 감지용, 7일 TTL)
    await this.redisService.setWithExpiry(
      `refresh:used:${tokenHash}`,
      userId,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    // 4. 새 토큰 발급
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isActivate) {
      throw new UserNotActiveException();
    }

    return this.issueTokens(user, deviceId);
  }

  async issueTokens(user: User, deviceId: string): Promise<AuthTokens> {
    // Access 토큰 발급 (JWT)
    const accessToken = this.globalJwtService.signUserToken({
      userId: user.id,
      email: user.email,
      sub: user.id,
    });

    // Refresh 토큰 발급 (랜덤 문자열)
    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    // 기존 디바이스 토큰 확인 및 삭제 (같은 디바이스에서 재로그인 시)
    const deviceKey = `refresh:device:${user.id}:${deviceId}`;
    const oldTokenHash = await this.redisService.get(deviceKey);

    if (oldTokenHash) {
      // 기존 토큰 무효화
      await this.redisService.delete(`refresh:valid:${oldTokenHash}`);
    }

    // Redis 화이트리스트에 저장 (7일 TTL)
    await this.redisService.setWithExpiry(
      `refresh:valid:${tokenHash}`,
      JSON.stringify({
        userId: user.id,
        deviceId: deviceId,
        issuedAt: new Date().toISOString(),
      }),
      REFRESH_TOKEN_TTL_SECONDS,
    );

    // 디바이스 매핑 저장 (deviceId → tokenHash)
    await this.redisService.setWithExpiry(
      deviceKey,
      tokenHash,
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
   * 로그아웃 (현재 디바이스만)
   * @param refreshToken - 리프레시 토큰
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.redisService.delete(`refresh:valid:${tokenHash}`);
  }

  /**
   * 사용자의 모든 디바이스에서 강제 로그아웃
   * @param userId - 사용자 ID
   */
  private async revokeAllUserTokens(userId: string): Promise<void> {
    const keys = await this.redisService.keys(`refresh:valid:*`);

    for (const key of keys) {
      const data = await this.redisService.get(key);
      if (data) {
        try {
          const { userId: tokenUserId } = JSON.parse(data);
          if (tokenUserId === userId) {
            await this.redisService.delete(key);
          }
        } catch {
          // JSON 파싱 실패 시 무시
          continue;
        }
      }
    }
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
  async exchangeOAuthCode(
    code: string,
    deviceId: string,
  ): Promise<AuthTokens> {
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
    return this.issueTokens(user, deviceId);
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
