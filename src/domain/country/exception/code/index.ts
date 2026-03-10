export enum CountryErrorCode {
  // 조회 관련 (G - Get)
  COUNTRY_NOT_FOUND = 'TRIP_CORE_HE_CTR_G001',
  REGION_NOT_FOUND = 'TRIP_CORE_HE_CTR_G002',

  // 검증 관련 (V - Validation)
  REGION_HAS_PLACES = 'TRIP_CORE_HE_CTR_V001',
  REGION_LIKE_ALREADY_EXISTS = 'TRIP_CORE_HE_CTR_V002',
}

export const CountryErrorMessage = {
  [CountryErrorCode.COUNTRY_NOT_FOUND]: '국가를 찾을 수 없습니다',
  [CountryErrorCode.REGION_NOT_FOUND]: '지역을 찾을 수 없습니다',
  [CountryErrorCode.REGION_HAS_PLACES]:
    '이 지역에 장소가 연결되어 있어 삭제할 수 없습니다',
  [CountryErrorCode.REGION_LIKE_ALREADY_EXISTS]: '이미 좋아요한 지역입니다',
} as const;
