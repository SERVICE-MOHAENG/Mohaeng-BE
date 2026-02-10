import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';
import { Provider } from '../entity/Provider.enum';

/**
 * UserRepository
 * @description
 * - User 엔티티에 대한 데이터 접근 계층
 * - TypeORM Repository 패턴 구현
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * 이메일로 사용자 조회
   * @param email - 사용자 이메일
   * @returns Promise<User | null>
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Provider와 ProviderId로 OAuth 사용자 조회
   * @param provider - OAuth 제공자 (GOOGLE, NAVER 등)
   * @param providerId - OAuth 제공자의 사용자 고유 ID
   * @returns Promise<User | null>
   */
  async findByProviderAndProviderId(
    provider: Provider,
    providerId: string,
  ): Promise<User | null> {
    return this.repository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  /**
   * ID로 사용자 조회
   * @param id - 사용자 ID
   * @returns Promise<User | null>
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * 사용자 저장
   * @param user - User 엔티티
   * @returns Promise<User> 저장된 사용자
   */
  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  /**
   * 사용자 존재 여부 확인
   * @param email - 사용자 이메일
   * @returns Promise<boolean>
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  /**
   * 사용자 삭제 (소프트 삭제 - isActivate = false)
   * @param id - 사용자 ID
   * @returns Promise<void>
   */
  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { isActivate: false });
  }

  /**
   * 사용자 영구 삭제
   * @param id - 사용자 ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * 모든 사용자 삭제 (테스트용)
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    await this.repository.clear();
  }
}
