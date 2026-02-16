/**
 * Notification Error Code
 * @description
 * - 알림 도메인 에러 코드
 * - 형식: HE_06XXYY (XX: 도메인, YY: 에러 순번)
 */
export enum NotificationErrorCode {
  NOTIFICATION_NOT_FOUND = 'HE_060101',
  NOTIFICATION_ACCESS_DENIED = 'HE_060102',
}
