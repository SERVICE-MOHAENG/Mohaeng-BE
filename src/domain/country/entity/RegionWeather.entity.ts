import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { WeatherPreference } from '../../preference/entity/WeatherPreference.enum';

/**
 * RegionWeather Entity
 * @description
 * - 지역별 날씨/계절 태그를 저장하는 테이블
 * - Region과 1:N 관계 (하나의 Region은 여러 WeatherPreference를 가질 수 있음)
 * - WeatherPreference는 Enum 타입 컬럼(region_weather)에 저장됨
 * - 설문 1번: 날씨와 계절감과 매칭
 */
@Entity('region_weather_table')
@Unique(['region', 'weather'])
export class RegionWeather extends BaseEntity {
  @ManyToOne(() => Region, (region) => region.weathers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({
    type: 'enum',
    enum: WeatherPreference,
    name: 'region_weather',
    nullable: false,
    comment: '날씨/계절 선호',
  })
  weather: WeatherPreference;

  /**
   * 지역 날씨 선호 생성 팩토리 메서드
   */
  static create(
    region: Region,
    weather: WeatherPreference,
  ): RegionWeather {
    const entity = new RegionWeather();
    entity.region = region;
    entity.weather = weather;
    return entity;
  }
}
