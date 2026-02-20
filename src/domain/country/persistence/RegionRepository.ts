import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entity/Region.entity';

/**
 * Region Repository
 * @description
 * - 지역 정보 데이터 접근 계층
 */
@Injectable()
export class RegionRepository {
  constructor(
    @InjectRepository(Region)
    private readonly repository: Repository<Region>,
  ) {}

  async findById(id: string): Promise<Region | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['country'],
    });
  }

  async findByName(name: string): Promise<Region | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findByCountryId(countryId: string): Promise<Region[]> {
    return this.repository.find({
      where: { country: { id: countryId } },
      order: { name: 'ASC' },
    });
  }

  async findAll(): Promise<Region[]> {
    return this.repository.find({
      relations: ['country'],
      order: { name: 'ASC' },
    });
  }

  async save(region: Region): Promise<Region> {
    return this.repository.save(region);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
