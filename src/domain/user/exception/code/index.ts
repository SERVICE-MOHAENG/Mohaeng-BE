export enum UserErrorCode {
  EMAIL_ALREADY_EXISTS = 'TRIP_CORE_HE_USR_V001',
  INVALID_SIGNUP_REQUEST = 'TRIP_CORE_HE_USR_V002',
  USER_NOT_FOUND = 'TRIP_CORE_HE_USR_G001',
  USER_NOT_ACTIVE = 'TRIP_CORE_HE_USR_A001',
  INVALID_PASSWORD = 'TRIP_CORE_HE_USR_V003',
  PASSWORD_MISMATCH = 'TRIP_CORE_HE_USR_V004',
}

export const UserErrorMessage = {
  [UserErrorCode.EMAIL_ALREADY_EXISTS]: '이미 존재하는 이메일입니다',
  [UserErrorCode.INVALID_SIGNUP_REQUEST]: '유효하지 않은 가입 요청입니다',
  [UserErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다',
  [UserErrorCode.USER_NOT_ACTIVE]: '비활성화된 사용자입니다',
  [UserErrorCode.INVALID_PASSWORD]: '비밀번호가 올바르지 않습니다',
  [UserErrorCode.PASSWORD_MISMATCH]: '비밀번호가 일치하지 않습니다',
} as const;
