/**
 * Place Error Code
 * @description
 * - 장소 도메인 에러 코드
 * - 형식: HE_03XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum PlaceErrorCode {
  PLACE_NOT_FOUND = 'HE_030101',
  PLACE_ALREADY_EXISTS = 'HE_030102',
}
