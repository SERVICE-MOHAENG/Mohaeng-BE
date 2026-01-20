import { Entity, Column, OneToMany, Check } from 'typeorm';
import { Max, Min } from 'class-validator';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { CourseCountry } from '../../course/entity/CourseCountry.entity';
import { Continent } from '../../preference/entity/Continent.enum';

/**
 * Country Entity
 * @description
 * - 국가 정보 엔티티
 * - 국가별 지역(Region)을 관리
 */
@Entity('country_table')
@Check('chk_country_popularity_score', '"popularity_score" >= 0 AND "popularity_score" <= 5')
export class Country extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'country_name',
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'country_code',
    nullable: false,
    unique: true,
    comment: 'ISO 3166-1 alpha-2 국가 코드 (예: KR, US, JP)',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'country_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'continent',
    nullable: false,
    comment: '소속 대륙',
  })
  continent: Continent;

  @Column({
    type: 'float',
    name: 'popularity_score',
    nullable: false,
    default: 0,
    comment: '인기도 점수 0-5',
  })
  @Min(0)
  @Max(5)
  popularityScore: number;

  @OneToMany(() => Region, (region) => region.country)
  regions: Region[];

  @OneToMany(() => CourseCountry, (courseCountry) => courseCountry.country)
  courseCountries: CourseCountry[];

  /**
   * 국가 생성 팩토리 메서드
   */
  static create(name: string, code: string, continent: Continent, imageUrl?: string): Country {
    const country = new Country();
    country.name = name;
    country.code = code.toUpperCase();
    country.continent = continent;
    country.imageUrl = imageUrl || null;
    country.popularityScore = 0;
    return country;
  }

  /**
   * 인기도 점수 증가
   */
  incrementPopularityScore(points: number = 1): void {
    this.popularityScore = Math.min(5, Math.max(0, this.popularityScore + points));
  }
}
