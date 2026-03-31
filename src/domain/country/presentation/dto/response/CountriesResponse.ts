import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../../entity/Country.entity';
import { CountryResponse } from './CountryResponse';

/**
 * CountriesResponse DTO
 * @description
 * - 전체 국가 목록 응답
 */
export class CountriesResponse {
  @ApiProperty({ description: '국가 목록', type: [CountryResponse] })
  countries: CountryResponse[];

  static from(countries: Country[]): CountriesResponse {
    const dto = new CountriesResponse();
    dto.countries = countries.map(CountryResponse.from);
    return dto;
  }
}
