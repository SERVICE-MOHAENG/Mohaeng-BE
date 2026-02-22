import { Injectable } from '@nestjs/common';
import { CountryRepository } from '../persistence/CountryRepository';
import { Country } from '../entity/Country.entity';
import { CountryNotFoundException } from '../exception/CountryNotFoundException';
import { Continent } from '../../preference/entity/Continent.enum';

/**
 * Country Service
 * @description
 * - 국가 도메인 비즈니스 로직
 */
@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  /**
   * ID로 국가 조회
   */
  async findById(id: string): Promise<Country> {
    const country = await this.countryRepository.findById(id);
    if (!country) {
      throw new CountryNotFoundException();
    }
    return country;
  }

  /**
   * 국가 코드로 국가 조회
   */
  async findByCode(code: string): Promise<Country> {
    const country = await this.countryRepository.findByCode(code);
    if (!country) {
      throw new CountryNotFoundException();
    }
    return country;
  }

  /**
   * 국가 이름으로 국가 조회
   */
  async findByName(name: string): Promise<Country> {
    const country = await this.countryRepository.findByName(name);
    if (!country) {
      throw new CountryNotFoundException();
    }
    return country;
  }

  /**
   * 모든 국가 조회
   */
  async findAll(): Promise<Country[]> {
    return this.countryRepository.findAll();
  }

  /**
   * 국가 생성
   */
  async create(name: string, code: string, continent: Continent, imageUrl?: string): Promise<Country> {
    const country = Country.create(name, code, continent, imageUrl);
    return this.countryRepository.save(country);
  }

  /**
   * 국가 삭제
   */
  async delete(id: string): Promise<void> {
    const country = await this.findById(id);
    await this.countryRepository.delete(country.id);
  }
}
