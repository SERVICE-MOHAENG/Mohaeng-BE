import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class GlobalRedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly subscribers: Set<Redis> = new Set();

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB') || 0;

    this.client = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  onModuleDestroy() {
    // Cleanup all subscribers
    for (const subscriber of this.subscribers) {
      subscriber.disconnect();
    }
    this.subscribers.clear();

    this.client.disconnect();
  }

  /**
   * 값을 저장합니다 (만료 시간 없음)
   */
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * 값을 저장하고 만료 시간을 설정합니다 (초 단위)
   */
  async setWithExpiry(
    key: string,
    value: string,
    expirySeconds: number,
  ): Promise<void> {
    await this.client.set(key, value, 'EX', expirySeconds);
  }

  /**
   * 값을 조회합니다
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * 값을 조회하고 즉시 삭제합니다 (원자적 연산)
   */
  async getAndDelete(key: string): Promise<string | null> {
    return await this.client.getdel(key);
  }

  /**
   * 키를 삭제합니다
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 키가 존재하는지 확인합니다
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 키의 남은 만료 시간을 조회합니다 (초 단위)
   * @returns 남은 시간(초), 만료 시간이 없으면 -1, 키가 없으면 -2
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * 키가 없을 때만 값을 저장하고 만료 시간을 설정합니다
   */
  async setIfNotExistsWithExpiry(
    key: string,
    value: string,
    expirySeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', expirySeconds, 'NX');
    return result === 'OK';
  }

  /**
   * 값을 1 증가시킵니다
   */
  async increment(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * 키 만료 시간을 설정합니다
   */
  async expire(key: string, expirySeconds: number): Promise<void> {
    await this.client.expire(key, expirySeconds);
  }

  /**
   * Set에 멤버를 추가합니다
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  /**
   * Set의 모든 멤버를 조회합니다
   */
  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  /**
   * Set에서 멤버를 제거합니다
   */
  async srem(key: string, ...members: string[]): Promise<number> {
    return await this.client.srem(key, ...members);
  }

  /**
   * 패턴에 매칭되는 모든 키를 조회합니다
   * 주의: KEYS 명령은 프로덕션 환경에서 성능 이슈를 유발할 수 있습니다
   * 프로덕션에서는 SCAN 명령 사용을 권장합니다
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * 패턴에 매칭되는 모든 키를 삭제합니다
   * 주의: KEYS 명령은 프로덕션 환경에서 성능 이슈를 유발할 수 있습니다
   */
  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Redis 클라이언트 인스턴스를 반환합니다 (고급 사용)
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 채널에 메시지를 발행합니다 (Pub/Sub)
   */
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  /**
   * 채널을 구독합니다 (Pub/Sub)
   * @returns 구독 해제 함수 (비동기)
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<() => Promise<void>> {
    const subscriber = this.client.duplicate();
    this.subscribers.add(subscriber);

    await subscriber.subscribe(channel);

    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(msg);
      }
    });

    return async () => {
      await subscriber.unsubscribe(channel);
      subscriber.disconnect();
      this.subscribers.delete(subscriber);
    };
  }
}
