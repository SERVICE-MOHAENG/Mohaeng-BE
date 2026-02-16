/**
 * Blog Error Code
 * @description
 * - 여행 블로그 도메인 에러 코드
 * - 형식: HE_05XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum BlogErrorCode {
  BLOG_NOT_FOUND = 'HE_050101',
  BLOG_ACCESS_DENIED = 'HE_050102',
  LIKE_ALREADY_EXISTS = 'HE_050201',
  LIKE_NOT_FOUND = 'HE_050202',
}
