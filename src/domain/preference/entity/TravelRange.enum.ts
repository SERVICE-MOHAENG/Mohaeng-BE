/**
 * TravelRange Enum
 * @description
 * - 여행 이동 거리 열거형
 * - 설문 2번: 이동 거리
 */
export enum TravelRange {
  DOMESTIC = 'DOMESTIC', // 가벼운 국내 여행
  SHORT_HAUL = 'SHORT_HAUL', // 가까운 해외 여행 (4시간 이내)
  LONG_HAUL = 'LONG_HAUL', // 이국적인 중장거리 (5시간 이상)
}
