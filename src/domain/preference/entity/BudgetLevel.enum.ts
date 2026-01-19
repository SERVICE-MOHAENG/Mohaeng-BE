/**
 * BudgetLevel Enum
 * @description
 * - 예산 수준 열거형
 * - 사용자 선호 예산 및 국가 평균 예산 분류에 사용
 */
export enum BudgetLevel {
  LOW = 'LOW', // 저예산 (백패킹, 게스트하우스)
  MEDIUM = 'MEDIUM', // 중예산 (일반 호텔, 관광)
  HIGH = 'HIGH', // 고예산 (럭셔리, 리조트)
}
