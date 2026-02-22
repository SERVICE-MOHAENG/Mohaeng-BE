import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entity/Country.entity';

/**
 * Country Repository
 * @description
 * - 국가 정보 데이터 접근 계층
 */
@Injectable()
export class CountryRepository {
  constructor(
    @InjectRepository(Country)
    private readonly repository: Repository<Country>,
  ) {}

  async findById(id: string): Promise<Country | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Country | null> {
    return this.repository.findOne({ where: { code: code.toUpperCase() } });
  }

  async findByName(name: string): Promise<Country | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAll(): Promise<Country[]> {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async save(country: Country): Promise<Country> {
    return this.repository.save(country);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
