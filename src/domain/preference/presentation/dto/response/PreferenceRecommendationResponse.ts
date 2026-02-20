import { ApiProperty } from '@nestjs/swagger';
import { PreferenceRecommendation } from '../../../entity/PreferenceRecommendation.entity';

/**
 * PreferenceRecommendationResponse
 * @description
 * - 여행지 추천 결과 응답 DTO
 * - Region DB 매핑 성공: 한글명 + 이미지 + 설명 포함
 * - Region DB 매핑 실패: regionName(코드값)만, 나머지 null
 */
export class PreferenceRecommendationResponse {
  @ApiProperty({ description: '지역명 (한글 또는 코드값)' })
  regionName: string;

  @ApiProperty({ description: '지역 설명', nullable: true })
  description: string | null;

  @ApiProperty({ description: '지역 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: 'Region UUID (DB 매핑 실패 시 null)', nullable: true })
  regionId: string | null;

  static from(
    recommendation: PreferenceRecommendation,
  ): PreferenceRecommendationResponse {
    const dto = new PreferenceRecommendationResponse();
    dto.regionId = recommendation.regionId ?? null;

    if (recommendation.region) {
      // Region 조인 성공 → DB의 한글명 + 이미지 + 설명 사용
      dto.regionName = recommendation.region.name;
      dto.description = recommendation.region.regionDescription ?? null;
      dto.imageUrl = recommendation.region.imageUrl ?? null;
    } else {
      // Region 조인 실패 → Python에서 받은 코드값 그대로
      dto.regionName = recommendation.regionName;
      dto.description = null;
      dto.imageUrl = null;
    }

    return dto;
  }
}
