import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../entity/UserPreference.entity';

/**
 * UserPreferenceRepository
 * @description
 * - UserPreference 엔티티에 대한 데이터 접근 계층
 * - TypeORM Repository 패턴 구현
 */
@Injectable()
export class UserPreferenceRepository {
  constructor(
    @InjectRepository(UserPreference)
    private readonly repository: Repository<UserPreference>,
  ) {}

  /**
   * ID로 선호도 조회 (모든 매핑 테이블 포함)
   * @param id - 선호도 ID
   * @returns Promise<UserPreference | null>
   */
  async findById(id: string): Promise<UserPreference | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'weatherPreferences',
        'travelRanges',
        'environments',
        'foodPersonalities',
        'mainInterests',
        'continents',
        'budgets',
      ],
    });
  }

  /**
   * 사용자 ID로 선호도 조회 (모든 매핑 테이블 포함)
   * @param userId - 사용자 ID
   * @returns Promise<UserPreference | null>
   */
  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.repository.findOne({
      where: { userId },
      relations: [
        'weatherPreferences',
        'travelRanges',
        'environments',
        'foodPersonalities',
        'mainInterests',
        'continents',
        'budgets',
      ],
    });
  }

  /**
   * 선호도 저장 (cascade로 매핑 테이블도 자동 저장)
   * @param preference - UserPreference 엔티티
   * @returns Promise<UserPreference>
   */
  async save(preference: UserPreference): Promise<UserPreference> {
    return this.repository.save(preference);
  }

  /**
   * 사용자의 선호도 존재 여부 확인
   * @param userId - 사용자 ID
   * @returns Promise<boolean>
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { userId } });
    return count > 0;
  }

  /**
   * 선호도 삭제 (cascade로 매핑 테이블도 자동 삭제)
   * @param id - 선호도 ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * 모든 선호도 삭제 (테스트용)
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    await this.repository.clear();
  }
}
