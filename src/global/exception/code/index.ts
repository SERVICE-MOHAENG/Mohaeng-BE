export enum GlobalErrorCode {
  UNAUTHORIZED = 'TRIP_CORE_HE_GLB_A001',
  FORBIDDEN = 'TRIP_CORE_HE_GLB_A002',
  INVALID_TOKEN = 'TRIP_CORE_HE_GLB_A003',
  MISSING_TOKEN = 'TRIP_CORE_HE_GLB_A004',
  USER_NOT_FOUND = 'TRIP_CORE_HE_GLB_G001',
  INVALID_REQUEST = 'TRIP_CORE_HE_GLB_V001',
  INTERNAL_SERVER_ERROR = 'TRIP_CORE_HE_GLB_C001',
  DATABASE_ERROR = 'TRIP_CORE_HE_GLB_C002',
  EXTERNAL_SERVICE_ERROR = 'TRIP_CORE_HE_GLB_N001',
}

export const GlobalErrorMessage = {
  [GlobalErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [GlobalErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
  [GlobalErrorCode.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [GlobalErrorCode.MISSING_TOKEN]: '토큰이 필요합니다.',
  [GlobalErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [GlobalErrorCode.INVALID_REQUEST]: '잘못된 요청입니다.',
  [GlobalErrorCode.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
  [GlobalErrorCode.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [GlobalErrorCode.EXTERNAL_SERVICE_ERROR]:
    '외부 서비스 연결 오류가 발생했습니다.',
} as const;
