import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { CourseCountry } from '../../course/entity/CourseCountry.entity';
import { Continent } from '../../preference/entity/Continent.enum';
import { CountryCode } from './CountryCode.enum';

/**
 * Country Entity
 * @description
 * - 국가 정보 엔티티
 * - 국가별 지역(Region)을 관리
 */
@Entity('country_table')
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
    type: 'enum',
    enum: CountryCode,
    name: 'country_code_enum',
    nullable: false,
    unique: true,
    comment: '국가 식별 enum 코드',
  })
  countryCode: CountryCode;

  @Column({
    type: 'enum',
    enum: Continent,
    name: 'continent',
    nullable: false,
    comment: '소속 대륙',
  })
  continent: Continent;

  @OneToMany(() => Region, (region) => region.country)
  regions: Region[];

  @OneToMany(() => CourseCountry, (courseCountry) => courseCountry.country)
  courseCountries: CourseCountry[];

  /**
   * 국가 생성 팩토리 메서드
   */
  static create(name: string, code: string, countryCode: CountryCode, continent: Continent, imageUrl?: string): Country {
    const country = new Country();
    country.name = name;
    country.code = code.toUpperCase();
    country.countryCode = countryCode;
    country.continent = continent;
    country.imageUrl = imageUrl || null;
    return country;
  }
}
