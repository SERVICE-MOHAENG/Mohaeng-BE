import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../../entity/Country.entity';

/**
 * CountryResponse DTO
 * @description
 * - 국가 단건 응답
 */
export class CountryResponse {
  @ApiProperty({ description: '국가 ID' })
  id: string;

  @ApiProperty({ description: '국가명' })
  name: string;

  @ApiProperty({ description: 'ISO 3166-1 alpha-2 국가 코드' })
  code: string;

  @ApiProperty({ description: '국가 대표 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '국가 식별 enum 코드' })
  countryCode: string;

  @ApiProperty({ description: '소속 대륙' })
  continent: string;

  static from(country: Country): CountryResponse {
    const dto = new CountryResponse();
    dto.id = country.id;
    dto.name = country.name;
    dto.code = country.code;
    dto.imageUrl = country.imageUrl;
    dto.countryCode = country.countryCode;
    dto.continent = country.continent;
    return dto;
  }
}
