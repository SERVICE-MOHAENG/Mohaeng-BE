export enum VisitedCountryErrorCode {
  // 조회 관련 (G - Get)
  VISITED_COUNTRY_NOT_FOUND = 'TRIP_CORE_HE_VCT_G001',

  // 권한 관련 (A - Authorization)
  VISITED_COUNTRY_ACCESS_DENIED = 'TRIP_CORE_HE_VCT_A001',
}

export const VisitedCountryErrorMessage = {
  [VisitedCountryErrorCode.VISITED_COUNTRY_NOT_FOUND]:
    '방문 국가를 찾을 수 없습니다',
  [VisitedCountryErrorCode.VISITED_COUNTRY_ACCESS_DENIED]:
    '방문 국가에 접근할 권한이 없습니다',
} as const;
