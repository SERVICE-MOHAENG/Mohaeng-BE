import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from './User.entity';
import { RefreshTokenStatus } from './RefreshTokenStatus.enum';

/**
 * RefreshToken Entity
 * @description
 * - Refresh Token 관리 엔티티
 * - 토큰 회전(rotation) 및 폐기(revoke) 지원
 */
@Entity('refresh_token_table')
export class RefreshToken extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500, name: 'token_hash', nullable: false })
  tokenHash: string;

  @Column({
    name: 'status',
    type: 'varchar',
    nullable: false,
    default: RefreshTokenStatus.ACTIVE,
  })
  status: RefreshTokenStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ name: 'rotated_at', type: 'timestamp', nullable: true })
  rotatedAt: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  /**
   * RefreshToken 생성 팩토리 메서드
   * @param user - 사용자 엔티티
   * @param tokenHash - 해시된 토큰
   * @param expiresAt - 만료 시각
   * @returns RefreshToken 인스턴스
   */
  static create(user: User, tokenHash: string, expiresAt: Date): RefreshToken {
    const refreshToken = new RefreshToken();
    refreshToken.user = user;
    refreshToken.tokenHash = tokenHash;
    refreshToken.status = RefreshTokenStatus.ACTIVE;
    refreshToken.expiresAt = expiresAt;
    refreshToken.rotatedAt = null;
    refreshToken.revokedAt = null;
    return refreshToken;
  }

  /**
   * 토큰 회전 처리
   * @description
   * - 상태를 ROTATED로 변경
   * - rotatedAt 시각 기록
   */
  rotate(): void {
    this.status = RefreshTokenStatus.ROTATED;
    this.rotatedAt = new Date();
  }

  /**
   * 토큰 강제 폐기 처리
   * @description
   * - 상태를 REVOKED로 변경
   * - revokedAt 시각 기록
   */
  revoke(): void {
    this.status = RefreshTokenStatus.REVOKED;
    this.revokedAt = new Date();
  }

  /**
   * 토큰 만료 여부 확인
   * @returns 만료되었으면 true
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * 토큰 활성 여부 확인
   * @returns 활성 상태이고 만료되지 않았으면 true
   */
  isActive(): boolean {
    return this.status === RefreshTokenStatus.ACTIVE && !this.isExpired();
  }
}
