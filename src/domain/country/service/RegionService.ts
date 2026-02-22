import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionRepository } from '../persistence/RegionRepository';
import { CountryService } from './CountryService';
import { Region } from '../entity/Region.entity';
import { Place } from '../../place/entity/Place.entity';
import { RegionNotFoundException } from '../exception/RegionNotFoundException';
import { RegionHasPlacesException } from '../exception/RegionHasPlacesException';
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
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
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
   * 국가 이름으로 지역 목록 조회
   */
  async findByCountryName(countryName: string): Promise<Region[]> {
    const country = await this.countryService.findByName(countryName);
    return this.regionRepository.findByCountryId(country.id);
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
   * @description
   * - 삭제 전 연결된 Place 존재 여부 확인
   * - Place가 있으면 RegionHasPlacesException 발생 (FK RESTRICT)
   */
  async delete(id: string): Promise<void> {
    const region = await this.findById(id);

    // 연결된 Place 개수 확인
    const placeCount = await this.placeRepository.count({
      where: { region: { id: region.id } },
    });

    if (placeCount > 0) {
      throw new RegionHasPlacesException(placeCount);
    }

    await this.regionRepository.delete(region.id);
  }
}
