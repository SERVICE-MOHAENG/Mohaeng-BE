export enum PreferenceErrorCode {
  // 조회 관련 (G - Get)
  PREFERENCE_JOB_NOT_FOUND = 'TRIP_CORE_HE_PRE_G001',

  // 검증 관련 (V - Validation)
  INVALID_CALLBACK_STATUS = 'TRIP_CORE_HE_PRE_V001',
  MISSING_CALLBACK_DATA = 'TRIP_CORE_HE_PRE_V002',
  MISSING_CALLBACK_ERROR = 'TRIP_CORE_HE_PRE_V003',
}

export const PreferenceErrorMessage = {
  [PreferenceErrorCode.PREFERENCE_JOB_NOT_FOUND]:
    '선호도 추천 작업을 찾을 수 없습니다',
  [PreferenceErrorCode.INVALID_CALLBACK_STATUS]:
    '유효하지 않은 콜백 상태입니다',
  [PreferenceErrorCode.MISSING_CALLBACK_DATA]:
    'SUCCESS 콜백에는 data가 필수입니다',
  [PreferenceErrorCode.MISSING_CALLBACK_ERROR]:
    'FAILED 콜백에는 error가 필수입니다',
} as const satisfies Record<PreferenceErrorCode, string>;
