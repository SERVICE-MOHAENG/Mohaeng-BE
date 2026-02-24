export enum AdminErrorCode {
  INVALID_CREDENTIALS = 'HE_050101',
  EMAIL_ALREADY_EXISTS = 'HE_050102',
  NOT_FOUND = 'HE_050103',
  INVALID_REFRESH_TOKEN = 'HE_050104',
  MISSING_REFRESH_TOKEN = 'HE_050105',
  NOT_ACTIVE = 'HE_050106',
}

export const AdminErrorMessage = {
  [AdminErrorCode.INVALID_CREDENTIALS]:
    '이메일 또는 비밀번호가 올바르지 않습니다',
  [AdminErrorCode.EMAIL_ALREADY_EXISTS]: '이미 사용 중인 이메일입니다',
  [AdminErrorCode.NOT_FOUND]: '관리자를 찾을 수 없습니다',
  [AdminErrorCode.INVALID_REFRESH_TOKEN]: '유효하지 않은 리프레시 토큰입니다',
  [AdminErrorCode.MISSING_REFRESH_TOKEN]: '리프레시 토큰이 필요합니다',
  [AdminErrorCode.NOT_ACTIVE]: '비활성화된 관리자 계정입니다',
} as const;
