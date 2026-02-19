export enum CourseErrorCode {
  // 조회 관련 (G - Get)
  COURSE_NOT_FOUND = 'TRIP_CORE_HE_CRS_G001',
  COURSE_LIKE_NOT_FOUND = 'TRIP_CORE_HE_CRS_G002',

  // 검증 관련 (V - Validation)
  INVALID_DATE_RANGE = 'TRIP_CORE_HE_CRS_V001',
  COURSE_BOOKMARK_ALREADY_EXISTS = 'TRIP_CORE_HE_CRS_V002',
  COURSE_LIKE_ALREADY_EXISTS = 'TRIP_CORE_HE_CRS_V003',

  // 권한 관련 (A - Authorization)
  COURSE_ACCESS_DENIED = 'TRIP_CORE_HE_CRS_A001',
}

export const CourseErrorMessage = {
  [CourseErrorCode.COURSE_NOT_FOUND]: '여행 코스를 찾을 수 없습니다',
  [CourseErrorCode.COURSE_LIKE_NOT_FOUND]: '좋아요를 찾을 수 없습니다',
  [CourseErrorCode.INVALID_DATE_RANGE]:
    '여행 시작일은 종료일보다 이전이어야 합니다',
  [CourseErrorCode.COURSE_BOOKMARK_ALREADY_EXISTS]:
    '이미 북마크한 코스입니다',
  [CourseErrorCode.COURSE_LIKE_ALREADY_EXISTS]: '이미 좋아요한 코스입니다',
  [CourseErrorCode.COURSE_ACCESS_DENIED]: '여행 코스에 대한 권한이 없습니다',
} as const;
