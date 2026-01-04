export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'TRIP_CORE_HE_AUTH_A001',
  MISSING_REFRESH_TOKEN = 'TRIP_CORE_HE_AUTH_A002',
  INVALID_REFRESH_TOKEN = 'TRIP_CORE_HE_AUTH_A003',
  EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER = 'TRIP_CORE_HE_AUTH_A004',
  GOOGLE_PROFILE_EMAIL_MISSING = 'TRIP_CORE_HE_AUTH_A005',
  INVALID_OAUTH_CODE = 'TRIP_CORE_HE_AUTH_A006',
  NAVER_PROFILE_EMAIL_MISSING = 'TRIP_CORE_HE_AUTH_A007',
}

export const AuthErrorMessage = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    '이메일 또는 비밀번호가 올바르지 않습니다',
  [AuthErrorCode.MISSING_REFRESH_TOKEN]: '리프레시 토큰이 필요합니다',
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: '유효하지 않은 리프레시 토큰입니다',
  [AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER]:
    '이미 다른 방식으로 가입된 이메일입니다',
  [AuthErrorCode.GOOGLE_PROFILE_EMAIL_MISSING]:
    '구글 계정에서 이메일 혹은 이름 정보를 가져올 수 없습니다',
  [AuthErrorCode.INVALID_OAUTH_CODE]: '유효하지 않거나 만료된 인증 코드입니다',
  [AuthErrorCode.NAVER_PROFILE_EMAIL_MISSING]:
    '네이버 계정에서 이메일 혹은 이름 정보를 가져올 수 없습니다',
} as const;
