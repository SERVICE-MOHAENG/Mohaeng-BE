import { Injectable } from '@nestjs/common';
import { RegionRepository } from '../persistence/RegionRepository';
import { CountryService } from './CountryService';
import { Region } from '../entity/Region.entity';
import { RegionNotFoundException } from '../exception/RegionNotFoundException';
import { TravelRange } from '../../preference/entity/TravelRange.enum';
import { BudgetLevel } from '../../preference/entity/BudgetLevel.enum';

/**
 * Region Service
 * @description
 * - 지역 도메인 비즈니스 로직
 */
@Injectable()
export class RegionService {
  constructor(
    private readonly regionRepository: RegionRepository,
    private readonly countryService: CountryService,
  ) {}

  /**
   * ID로 지역 조회
   */
  async findById(id: string): Promise<Region> {
    const region = await this.regionRepository.findById(id);
    if (!region) {
      throw new RegionNotFoundException();
    }
    return region;
  }

  /**
   * 국가 ID로 지역 목록 조회
   */
  async findByCountryId(countryId: string): Promise<Region[]> {
    return this.regionRepository.findByCountryId(countryId);
  }

  /**
   * 모든 지역 조회
   */
  async findAll(): Promise<Region[]> {
    return this.regionRepository.findAll();
  }

  /**
   * 지역 생성
   */
  async create(
    name: string,
    countryId: string,
    travelRange: TravelRange,
    averageBudgetLevel: BudgetLevel = BudgetLevel.BALANCED,
    latitude?: number,
    longitude?: number,
    imageUrl?: string,
  ): Promise<Region> {
    const country = await this.countryService.findById(countryId);
    const region = Region.create(name, country, travelRange, averageBudgetLevel, latitude, longitude, imageUrl);
    return this.regionRepository.save(region);
  }

  /**
   * 지역 삭제
   */
  async delete(id: string): Promise<void> {
    const region = await this.findById(id);
    await this.regionRepository.delete(region.id);
  }
}
