import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Country } from './Country.entity';

/**
 * Region Entity
 * @description
 * - 지역 정보 엔티티
 * - 국가별 세부 지역(도시, 주 등)을 관리
 */
@Entity('region_table')
export class Region extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'region_name',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'latitude',
    nullable: true,
    comment: '위도',
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'longitude',
    nullable: true,
    comment: '경도',
  })
  longitude: number | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'region_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @ManyToOne(() => Country, (country) => country.regions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  /**
   * 지역 생성 팩토리 메서드
   */
  static create(
    name: string,
    country: Country,
    latitude?: number,
    longitude?: number,
    imageUrl?: string,
  ): Region {
    const region = new Region();
    region.name = name;
    region.country = country;
    region.latitude = latitude || null;
    region.longitude = longitude || null;
    region.imageUrl = imageUrl || null;
    return region;
  }
}
