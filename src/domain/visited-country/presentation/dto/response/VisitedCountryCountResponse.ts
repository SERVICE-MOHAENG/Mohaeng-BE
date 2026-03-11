import { ApiProperty } from '@nestjs/swagger';

export class VisitedCountryCountResponse {
  @ApiProperty({ description: '방문한 국가 수', example: 16 })
  count: number;

  static from(count: number): VisitedCountryCountResponse {
    const response = new VisitedCountryCountResponse();
    response.count = count;
    return response;
  }
}
