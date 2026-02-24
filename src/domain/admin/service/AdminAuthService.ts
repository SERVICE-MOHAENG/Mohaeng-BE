import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entity/Admin.entity';
import { AdminRepository } from '../persistence/AdminRepository';
import { GlobalJwtService } from '../../../global/jwt/GlobalJwtService';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';
import { AdminInvalidCredentialsException } from '../exception/AdminInvalidCredentialsException';
import { AdminEmailAlreadyExistsException } from '../exception/AdminEmailAlreadyExistsException';
import { AdminNotFoundException } from '../exception/AdminNotFoundException';
import { AdminInvalidRefreshTokenException } from '../exception/AdminInvalidRefreshTokenException';
import { AdminNotActiveException } from '../exception/AdminNotActiveException';

type AdminAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7일
const BCRYPT_SALT_ROUNDS = 11;

/**
 * AdminAuthService
 * @description
 * - 관리자 인증 서비스 (RTR 기반, User와 동일 패턴)
 * - Redis key: refresh:admin:{adminId}:{jti}
 */
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly globalJwtService: GlobalJwtService,
    private readonly redisService: GlobalRedisService,
  ) {}

  /**
   * 관리자 등록
   * @param email 이메일
   * @param password 비밀번호 (평문)
   * @param isSuperAdmin 슈퍼어드민 여부
   */
  async register(
    email: string,
    password: string,
    isSuperAdmin: boolean = false,
  ): Promise<Admin> {
    const exists = await this.adminRepository.existsByEmail(email);
    if (exists) {
      throw new AdminEmailAlreadyExistsException();
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const admin = Admin.create(email, passwordHash, isSuperAdmin);
    return this.adminRepository.save(admin);
  }

  /**
   * 관리자 로그인
   */
  async login(email: string, password: string): Promise<AdminAuthTokens> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new AdminInvalidCredentialsException();
    }

    if (!admin.isActive) {
      throw new AdminNotActiveException();
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new AdminInvalidCredentialsException();
    }

    return this.issueTokens(admin);
  }

  /**
   * 토큰 갱신 (RTR)
   */
  async refreshTokens(refreshToken: string): Promise<AdminAuthTokens> {
    let payload: { adminId: string; jti: string };
    try {
      payload = this.globalJwtService.verifyAdminRefreshToken(refreshToken);
    } catch {
      throw new AdminInvalidRefreshTokenException();
    }

    const { adminId, jti } = payload;
    const tokenKey = `refresh:admin:${adminId}:${jti}`;
    const storedData = await this.redisService.get(tokenKey);

    if (!storedData) {
      // 토큰 없음 → 모든 어드민 토큰 삭제 (보안 조치)
      await this.revokeAllAdminTokens(adminId);
      throw new AdminInvalidRefreshTokenException();
    }

    const parts = storedData.split(':');
    if (parts.length !== 2) {
      await this.revokeAllAdminTokens(adminId);
      throw new AdminInvalidRefreshTokenException();
    }

    const storedHash = parts[0];
    const tokenHash = this.hashToken(refreshToken);
    if (!storedHash || storedHash !== tokenHash) {
      await this.revokeAllAdminTokens(adminId);
      throw new AdminInvalidRefreshTokenException();
    }

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AdminNotFoundException();
    }

    if (!admin.isActive) {
      throw new AdminNotActiveException();
    }

    return this.issueTokens(admin, jti);
  }

  /**
   * 토큰 발급 (Access + Refresh, RTR)
   */
  async issueTokens(
    admin: Admin,
    existingJti?: string,
  ): Promise<AdminAuthTokens> {
    let jti: string;

    if (existingJti) {
      // Refresh 요청: 기존 jti 재사용 (같은 디바이스 슬롯 유지)
      jti = existingJti;
      const oldKey = `refresh:admin:${admin.id}:${existingJti}`;
      await this.redisService.delete(oldKey);
    } else {
      // 신규 로그인: LRU 처리 (최대 3개 슬롯)
      const pattern = `refresh:admin:${admin.id}:*`;
      const existingKeys = await this.redisService.keys(pattern);

      if (existingKeys.length >= 3) {
        const tokensWithTime: Array<{ key: string; createdAt: number }> = [];

        for (const key of existingKeys) {
          const data = await this.redisService.get(key);
          if (!data) continue;

          const parts = data.split(':');
          if (parts.length !== 2) continue;

          const createdAt = Number(parts[1]);
          if (isNaN(createdAt) || createdAt <= 0) continue;

          tokensWithTime.push({ key, createdAt });
        }

        if (tokensWithTime.length > 0) {
          tokensWithTime.sort((a, b) => a.createdAt - b.createdAt);
          await this.redisService.delete(tokensWithTime[0].key);
        }
      }

      jti = randomBytes(16).toString('hex');
    }

    // Access Token 발급 (Admin 전용 secret)
    const accessToken = this.globalJwtService.signAdminToken({
      adminId: admin.id,
      email: admin.email,
      permissions: admin.permissions,
      isSuperAdmin: admin.isSuperAdmin,
    });

    // Refresh Token 발급 (Admin 전용 secret)
    const refreshToken = this.globalJwtService.signAdminRefreshToken({
      adminId: admin.id,
      jti,
    });

    const tokenHash = this.hashToken(refreshToken);
    const createdAt = Date.now();

    const tokenKey = `refresh:admin:${admin.id}:${jti}`;
    await this.redisService.setWithExpiry(
      tokenKey,
      `${tokenHash}:${createdAt}`,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }

  /**
   * 관리자의 모든 리프레시 토큰 삭제 (강제 로그아웃)
   */
  async revokeAllAdminTokens(adminId: string): Promise<void> {
    await this.redisService.deletePattern(`refresh:admin:${adminId}:*`);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
