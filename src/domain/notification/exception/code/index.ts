export enum NotificationErrorCode {
  // 조회 관련 (G - Get)
  NOTIFICATION_NOT_FOUND = 'TRIP_CORE_HE_NTF_G001',
}

export const NotificationErrorMessage = {
  [NotificationErrorCode.NOTIFICATION_NOT_FOUND]: '알림을 찾을 수 없습니다',
} as const;
