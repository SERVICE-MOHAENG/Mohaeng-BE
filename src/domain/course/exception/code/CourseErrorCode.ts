/**
 * Course Error Code
 * @description
 * - 여행 코스 도메인 에러 코드
 * - 형식: HE_04XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum CourseErrorCode {
  COURSE_NOT_FOUND = 'HE_040101',
  COURSE_ACCESS_DENIED = 'HE_040102',
  COURSE_PLACE_NOT_FOUND = 'HE_040201',
  LIKE_ALREADY_EXISTS = 'HE_040301',
  LIKE_NOT_FOUND = 'HE_040302',
  BOOKMARK_ALREADY_EXISTS = 'HE_040401',
  BOOKMARK_NOT_FOUND = 'HE_040402',
}
