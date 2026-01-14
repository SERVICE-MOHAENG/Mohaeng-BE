import { Injectable } from '@nestjs/common';
import { PlaceRepository } from '../persistence/PlaceRepository';
import { Place } from '../entity/Place.entity';
import { PlaceNotFoundException } from '../exception/PlaceNotFoundException';
import { Region } from '../../country/entity/Region.entity';

/**
 * Place Service
 * @description
 * - 장소 도메인 비즈니스 로직
 */
@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  /**
   * ID로 장소 조회
   */
  async findById(id: string): Promise<Place> {
    const place = await this.placeRepository.findById(id);
    if (!place) {
      throw new PlaceNotFoundException();
    }
    return place;
  }

  /**
   * 지역 ID로 장소 목록 조회
   */
  async findByRegionId(regionId: string): Promise<Place[]> {
    return this.placeRepository.findByRegionId(regionId);
  }

  /**
   * 모든 장소 조회 (페이징)
   */
  async findAll(page: number = 1, limit: number = 20): Promise<[Place[], number]> {
    return this.placeRepository.findAll(page, limit);
  }

  /**
   * 장소 생성
   */
  async create(
    name: string,
    description?: string,
    imageUrl?: string,
    latitude?: number,
    longitude?: number,
    address?: string,
    openingHours?: string,
    category?: string,
    region?: Region,
  ): Promise<Place> {
    const place = Place.create(
      name,
      description,
      imageUrl,
      latitude,
      longitude,
      address,
      openingHours,
      category,
      region,
    );
    return this.placeRepository.save(place);
  }

  /**
   * 장소 삭제
   */
  async delete(id: string): Promise<void> {
    const place = await this.findById(id);
    await this.placeRepository.delete(place.id);
  }
}
