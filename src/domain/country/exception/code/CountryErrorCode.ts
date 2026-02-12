/**
 * Country Error Code
 * @description
 * - 국가 도메인 에러 코드
 * - 형식: HE_02XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum CountryErrorCode {
  COUNTRY_NOT_FOUND = 'HE_020101',
  COUNTRY_ALREADY_EXISTS = 'HE_020102',
  REGION_NOT_FOUND = 'HE_020201',
  REGION_ALREADY_EXISTS = 'HE_020202',
  REGION_HAS_PLACES = 'HE_020203',
}
