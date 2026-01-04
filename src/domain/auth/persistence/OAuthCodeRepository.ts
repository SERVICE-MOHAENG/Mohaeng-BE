import { Injectable } from '@nestjs/common';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';
import { randomBytes } from 'crypto';

export interface OAuthCodeData {
  userId: string;
  email: string;
}

/**
 * OAuthCodeRepository
 * @description
 * - OAuth 인증 코드 저장소 (Redis 기반)
 * - 일회용 코드를 생성하고 저장/조회/삭제
 * - 5분 TTL 적용
 */
@Injectable()
export class OAuthCodeRepository {
  private readonly CODE_PREFIX = 'oauth:code:';
  private readonly CODE_EXPIRY_SECONDS = 300; // 5분

  constructor(private readonly redisService: GlobalRedisService) {}

  /**
   * 랜덤 인증 코드를 생성합니다 (64자 hex)
   */
  generateCode(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 인증 코드를 저장합니다
   * @param code 인증 코드
   * @param data 저장할 사용자 데이터
   */
  async save(code: string, data: OAuthCodeData): Promise<void> {
    const key = this.CODE_PREFIX + code;
    const value = JSON.stringify(data);
    await this.redisService.setWithExpiry(
      key,
      value,
      this.CODE_EXPIRY_SECONDS,
    );
  }

  /**
   * 인증 코드로 데이터를 조회하고 즉시 삭제합니다 (일회용)
   * @param code 인증 코드
   * @returns 사용자 데이터 또는 null
   */
  async findAndDelete(code: string): Promise<OAuthCodeData | null> {
    const key = this.CODE_PREFIX + code;
    const value = await this.redisService.getAndDelete(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as OAuthCodeData;
    } catch {
      return null;
    }
  }

  /**
   * 인증 코드가 존재하는지 확인합니다
   * @param code 인증 코드
   */
  async exists(code: string): Promise<boolean> {
    const key = this.CODE_PREFIX + code;
    return await this.redisService.exists(key);
  }

  /**
   * 인증 코드를 삭제합니다
   * @param code 인증 코드
   */
  async delete(code: string): Promise<void> {
    const key = this.CODE_PREFIX + code;
    await this.redisService.delete(key);
  }
}
