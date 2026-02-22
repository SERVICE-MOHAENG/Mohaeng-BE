import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserVisitedCountry } from '../entity/UserVisitedCountry.entity';

/**
 * UserVisitedCountry Repository
 * @description
 * - 사용자 방문 국가 정보 데이터 접근 계층
 */
@Injectable()
export class UserVisitedCountryRepository {
  constructor(
    @InjectRepository(UserVisitedCountry)
    private readonly repository: Repository<UserVisitedCountry>,
  ) {}

  async findById(id: string): Promise<UserVisitedCountry | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['user', 'country'],
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return null;
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<UserVisitedCountry[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['country'],
      order: { visitDate: 'DESC' },
    });
  }

  /**
   * 사용자의 방문 국가 목록 조회 (페이지네이션)
   */
  async findByUserIdWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[UserVisitedCountry[], number]> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['country'],
      order: { visitDate: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
  }

  async findByUserIdAndCountryId(
    userId: string,
    countryId: string,
  ): Promise<UserVisitedCountry | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        country: { id: countryId },
      },
      relations: ['user', 'country'],
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { user: { id: userId } },
    });
  }

  async save(
    visitedCountry: UserVisitedCountry,
  ): Promise<UserVisitedCountry> {
    return this.repository.save(visitedCountry);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
