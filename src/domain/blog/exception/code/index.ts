export enum BlogErrorCode {
  // 조회 관련 (G - Get)
  BLOG_NOT_FOUND = 'TRIP_CORE_HE_BLG_G001',
  BLOG_LIKE_NOT_FOUND = 'TRIP_CORE_HE_BLG_G002',

  // 검증 관련 (V - Validation)
  BLOG_LIKE_ALREADY_EXISTS = 'TRIP_CORE_HE_BLG_V001',

  // 권한 관련 (A - Authorization)
  BLOG_ACCESS_DENIED = 'TRIP_CORE_HE_BLG_A001',
}

export const BlogErrorMessage = {
  [BlogErrorCode.BLOG_NOT_FOUND]: '여행 블로그를 찾을 수 없습니다',
  [BlogErrorCode.BLOG_LIKE_NOT_FOUND]: '좋아요를 찾을 수 없습니다',
  [BlogErrorCode.BLOG_LIKE_ALREADY_EXISTS]: '이미 좋아요한 블로그입니다',
  [BlogErrorCode.BLOG_ACCESS_DENIED]: '블로그에 접근할 권한이 없습니다',
} as const;
