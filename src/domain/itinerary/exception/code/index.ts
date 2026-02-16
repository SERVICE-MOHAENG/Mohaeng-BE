export enum ItineraryErrorCode {
  // 조회 관련 (G - Get)
  ITINERARY_NOT_FOUND = 'TRIP_CORE_HE_ITI_G001',
  ITINERARY_JOB_NOT_FOUND = 'TRIP_CORE_HE_ITI_G002',
  SURVEY_NOT_FOUND = 'TRIP_CORE_HE_ITI_G003',
  NO_DESTINATION_FOR_DATE = 'TRIP_CORE_HE_ITI_G004',

  // 검증 관련 (V - Validation)
  INVALID_CALLBACK_SECRET = 'TRIP_CORE_HE_ITI_V001',
  ITINERARY_JOB_ALREADY_PROCESSING = 'TRIP_CORE_HE_ITI_V002',
  CHAT_LIMIT_EXCEEDED = 'TRIP_CORE_HE_ITI_V003',

  // 권한 관련 (A - Authorization)
  UNAUTHORIZED_ITINERARY_ACCESS = 'TRIP_CORE_HE_ITI_A001',
}

export const ItineraryErrorMessage = {
  [ItineraryErrorCode.ITINERARY_NOT_FOUND]: '로드맵을 찾을 수 없습니다',
  [ItineraryErrorCode.ITINERARY_JOB_NOT_FOUND]:
    '일정 생성 작업을 찾을 수 없습니다',
  [ItineraryErrorCode.SURVEY_NOT_FOUND]: '설문을 찾을 수 없습니다',
  [ItineraryErrorCode.NO_DESTINATION_FOR_DATE]:
    '해당 날짜에 대한 목적지를 찾을 수 없습니다',
  [ItineraryErrorCode.INVALID_CALLBACK_SECRET]:
    '유효하지 않은 서비스 인증입니다',
  [ItineraryErrorCode.ITINERARY_JOB_ALREADY_PROCESSING]:
    '이미 처리 중인 일정 생성 작업이 있습니다',
  [ItineraryErrorCode.CHAT_LIMIT_EXCEEDED]:
    '이 로드맵은 최대 대화 횟수(5회)에 도달했습니다. 더 이상 수정할 수 없습니다.',
  [ItineraryErrorCode.UNAUTHORIZED_ITINERARY_ACCESS]:
    '이 로드맵에 접근할 권한이 없습니다',
} as const;
