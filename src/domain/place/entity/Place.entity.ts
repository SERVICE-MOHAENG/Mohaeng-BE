import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Region } from '../../country/entity/Region.entity';

/**
 * Place Entity
 * @description
 * - 장소 정보 엔티티
 * - 구글 Places API 기반 장소 정보 관리
 * - updated_at 기준 30일마다 API 호출하여 정보 갱신
 */
@Entity('place')
export class Place {
  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    name: 'place_id',
    comment: '구글 디비에서 식별하는 장소 아이디',
  })
  placeId: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'place_name',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'decimal',
    name: 'latitude',
    nullable: false,
  })
  latitude: number;

  @Column({
    type: 'decimal',
    name: 'longitude',
    nullable: false,
  })
  longitude: number;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'address',
    nullable: false,
  })
  address: string;

  @Column({
    type: 'timestamp',
    name: 'updated_at',
    nullable: false,
    comment: '30일 마다 다시 조회해야함',
  })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'place_url',
    nullable: false,
    comment: '사용자가 클릭해서 들어가는 url',
  })
  placeUrl: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  /**
   * 장소 생성 팩토리 메서드
   */
  static create(
    placeId: string,
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    placeUrl: string,
    region: Region,
    description?: string,
  ): Place {
    const place = new Place();
    place.placeId = placeId;
    place.name = name;
    place.address = address;
    place.latitude = latitude;
    place.longitude = longitude;
    place.placeUrl = placeUrl;
    place.region = region;
    place.description = description || null;
    place.updatedAt = new Date();
    return place;
  }
}
