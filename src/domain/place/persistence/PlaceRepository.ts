import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from '../entity/Place.entity';

/**
 * Place Repository
 * @description
 * - 장소 정보 데이터 접근 계층
 */
@Injectable()
export class PlaceRepository {
  constructor(
    @InjectRepository(Place)
    private readonly repository: Repository<Place>,
  ) {}

  async findById(placeId: string): Promise<Place | null> {
    return this.repository.findOne({
      where: { placeId },
      relations: ['region', 'region.country'],
    });
  }

  async findByRegionId(regionId: string): Promise<Place[]> {
    return this.repository.find({
      where: { region: { id: regionId } },
      relations: ['region', 'region.country'],
      order: { name: 'ASC' },
    });
  }

  async findAll(page: number = 1, limit: number = 20): Promise<[Place[], number]> {
    return this.repository.findAndCount({
      relations: ['region', 'region.country'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async save(place: Place): Promise<Place> {
    return this.repository.save(place);
  }

  async delete(placeId: string): Promise<void> {
    await this.repository.delete({ placeId });
  }
}
