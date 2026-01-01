/**
 * RefreshToken Status Enum
 * @description
 * - ACTIVE: 활성 상태
 * - ROTATED: 회전됨 (새 토큰으로 교체됨)
 * - REVOKED: 강제 폐기됨
 */
export enum RefreshTokenStatus {
  ACTIVE = 'ACTIVE',
  ROTATED = 'ROTATED',
  REVOKED = 'REVOKED',
}
