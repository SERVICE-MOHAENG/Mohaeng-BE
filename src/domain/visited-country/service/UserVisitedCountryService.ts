import { Injectable } from '@nestjs/common';
import { UserVisitedCountryRepository } from '../persistence/UserVisitedCountryRepository';
import { UserVisitedCountry } from '../entity/UserVisitedCountry.entity';
import { VisitedCountryNotFoundException } from '../exception/VisitedCountryNotFoundException';
import { VisitedCountryAccessDeniedException } from '../exception/VisitedCountryAccessDeniedException';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';
import { AddVisitedCountryRequest } from '../presentation/dto/request/AddVisitedCountryRequest';

/**
 * UserVisitedCountry Service
 * @description
 * - 사용자 방문 국가 도메인 비즈니스 로직
 */
@Injectable()
export class UserVisitedCountryService {
  constructor(
    private readonly userVisitedCountryRepository: UserVisitedCountryRepository,
  ) {}

  /**
   * ID로 방문 국가 조회
   */
  async findById(id: string): Promise<UserVisitedCountry> {
    const visitedCountry =
      await this.userVisitedCountryRepository.findById(id);
    if (!visitedCountry) {
      throw new VisitedCountryNotFoundException();
    }
    return visitedCountry;
  }

  /**
   * 사용자 ID로 방문 국가 목록 조회
   */
  async findByUserId(userId: string): Promise<UserVisitedCountry[]> {
    return this.userVisitedCountryRepository.findByUserId(userId);
  }

  /**
   * 사용자의 방문 국가 개수 조회
   */
  async countByUserId(userId: string): Promise<number> {
    return this.userVisitedCountryRepository.countByUserId(userId);
  }

  /**
   * 방문 국가 생성 또는 방문 날짜 업데이트"
   */
  async createOrUpdateVisitDate(
    user: User,
    country: Country,
    visitDate?: Date,
  ): Promise<UserVisitedCountry> {
    const existing =
      await this.userVisitedCountryRepository.findByUserIdAndCountryId(
        user.id,
        country.id,
      );

    if (existing) {
      if (visitDate) {
        existing.visitDate = visitDate;
      }
      return this.userVisitedCountryRepository.save(existing);
    }

    const visitedCountry = UserVisitedCountry.create(user, country, visitDate);
    return this.userVisitedCountryRepository.save(visitedCountry);
  }

  /**
   * 방문 국가 생성
   */
  async create(
    userId: string,
    country: Country,
    request: AddVisitedCountryRequest,
  ): Promise<UserVisitedCountry> {
    const user = new User();
    user.id = userId;

    const visitDate = new Date(request.visitDate);
    const visitedCountry = UserVisitedCountry.create(user, country, visitDate);
    return this.userVisitedCountryRepository.save(visitedCountry);
  }

  /**
   * 방문 국가 삭제 (소유권 검증 포함)
   */
  async delete(id: string, userId: string): Promise<void> {
    const visitedCountry = await this.findById(id);

    // 소유권 검증
    if (visitedCountry.user.id !== userId) {
      throw new VisitedCountryAccessDeniedException();
    }

    await this.userVisitedCountryRepository.delete(visitedCountry.id);
  }
}
