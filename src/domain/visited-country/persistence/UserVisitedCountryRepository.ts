import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'country'],
    });
  }

  async findByUserId(userId: string): Promise<UserVisitedCountry[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['country'],
      order: { visitDate: 'DESC' },
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
