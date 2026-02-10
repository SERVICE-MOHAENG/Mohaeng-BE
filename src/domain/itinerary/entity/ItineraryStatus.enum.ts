/**
 * ItineraryStatus Enum
 * @description
 * - 여행 일정 생성 작업 상태
 * - PENDING: 대기 중 (큐에 등록됨)
 * - PROCESSING: 처리 중 (Python LLM 서버에서 생성 중)
 * - SUCCESS: 생성 완료
 * - FAILED: 생성 실패
 */
export enum ItineraryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
