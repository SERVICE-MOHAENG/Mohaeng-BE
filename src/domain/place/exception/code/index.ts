export enum PlaceErrorCode {
  // 조회 관련 (G - Get)
  PLACE_NOT_FOUND = 'TRIP_CORE_HE_PLC_G001',
}

export const PlaceErrorMessage = {
  [PlaceErrorCode.PLACE_NOT_FOUND]: '장소를 찾을 수 없습니다',
} as const;
