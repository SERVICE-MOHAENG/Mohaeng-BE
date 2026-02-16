/**
 * VisitedCountry Error Code
 * @description
 * - 방문 국가 도메인 에러 코드
 * - 형식: HE_07XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum VisitedCountryErrorCode {
  VISITED_COUNTRY_NOT_FOUND = 'HE_070101',
  VISITED_COUNTRY_ALREADY_EXISTS = 'HE_070102',
  VISITED_COUNTRY_ACCESS_DENIED = 'HE_070103',
}
