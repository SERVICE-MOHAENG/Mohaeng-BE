import { ApiProperty } from '@nestjs/swagger';
import { UserVisitedCountry } from '../../../entity/UserVisitedCountry.entity';

/**
 * VisitedCountryResponse DTO
 * @description
 * - 방문 국가 응답
 */
export class VisitedCountryResponse {
  @ApiProperty({ description: '방문 국가 ID' })
  id: string;

  @ApiProperty({ description: '국가명' })
  countryName: string;

  @ApiProperty({ description: '방문 날짜', nullable: true })
  visitDate: Date | null;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  /**
   * Entity를 Response DTO로 변환
   */
  static fromEntity(entity: UserVisitedCountry): VisitedCountryResponse {
    return {
      id: entity.id,
      countryName: entity.country.name,
      visitDate: entity.visitDate,
      createdAt: entity.createdAt,
    };
  }
}
