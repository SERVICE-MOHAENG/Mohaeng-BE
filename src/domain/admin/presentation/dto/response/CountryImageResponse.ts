import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../../../country/entity/Country.entity';

export class CountryImageResponse {
  @ApiProperty({ description: '국가 ID' })
  id: string;

  @ApiProperty({ description: '국가명' })
  name: string;

  @ApiProperty({ description: '업데이트된 이미지 URL', nullable: true })
  imageUrl: string | null;

  static from(country: Country): CountryImageResponse {
    const dto = new CountryImageResponse();
    dto.id = country.id;
    dto.name = country.name;
    dto.imageUrl = country.imageUrl;
    return dto;
  }
}
