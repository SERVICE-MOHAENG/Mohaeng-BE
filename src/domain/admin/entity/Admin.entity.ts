import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';

/**
 * Admin Entity
 * @description
 * - 관리자 계정 엔티티
 * - 비트마스크 기반 권한 관리
 */
@Entity('admin_table')
export class Admin extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'username',
    nullable: false,
    unique: true,
    comment: '관리자 아이디',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'int',
    name: 'permissions',
    nullable: false,
    default: 0,
    comment: '비트마스크 기반 권한',
  })
  permissions: number;

  @Column({
    type: 'boolean',
    name: 'is_super_admin',
    nullable: false,
    default: false,
    comment: '슈퍼 어드민 여부',
  })
  isSuperAdmin: boolean;

  @Column({
    type: 'boolean',
    name: 'is_active',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  /**
   * 관리자 생성 팩토리 메서드
   */
  static create(
    username: string,
    passwordHash: string,
    isSuperAdmin: boolean = false,
  ): Admin {
    const admin = new Admin();
    admin.username = username;
    admin.passwordHash = passwordHash;
    admin.permissions = 0;
    admin.isSuperAdmin = isSuperAdmin;
    admin.isActive = true;
    return admin;
  }
}
