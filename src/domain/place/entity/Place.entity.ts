import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from '../../country/entity/Region.entity';

/**
 * Place Entity
 * @description
 * - 장소 정보 엔티티
 * - 여행지, 관광지 등의 장소 정보를 관리
 */
@Entity('place_table')
export class Place extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 200,
    name: 'place_name',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    name: 'place_description',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'place_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'latitude',
    nullable: true,
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'longitude',
    nullable: true,
  })
  longitude: number | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'address',
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'opening_hours',
    nullable: true,
    comment: '영업시간',
  })
  openingHours: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'category',
    nullable: true,
    comment: '장소 카테고리 (음식점, 관광지, 숙박 등)',
  })
  category: string | null;

  @ManyToOne(() => Region, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'region_id' })
  region: Region | null;

  /**
   * 장소 생성 팩토리 메서드
   */
  static create(
    name: string,
    description?: string,
    imageUrl?: string,
    latitude?: number,
    longitude?: number,
    address?: string,
    openingHours?: string,
    category?: string,
    region?: Region,
  ): Place {
    const place = new Place();
    place.name = name;
    place.description = description || null;
    place.imageUrl = imageUrl || null;
    place.latitude = latitude || null;
    place.longitude = longitude || null;
    place.address = address || null;
    place.openingHours = openingHours || null;
    place.category = category || null;
    place.region = region || null;
    return place;
  }
}
