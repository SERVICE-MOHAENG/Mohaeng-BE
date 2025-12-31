import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';

/**
 * User Entity
 * @description
 * - 사용자 정보 엔티티
 * - 일반 회원가입 및 OAuth 로그인 지원
 */
@Entity('user_table')
export class User extends BaseEntity {
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'email', nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ name: 'provider', type: 'varchar', length: 50, nullable: true })
  provider: string | null;

  @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
  providerId: string | null;

  @Column({ name: 'is_activate', nullable: false, default: true })
  isActivate: boolean;

  /**
   * 일반 회원가입용 팩토리 메서드
   * @param name - 사용자 이름
   * @param email - 이메일
   * @param password - 비밀번호
   * @returns User 인스턴스
   */
  static create(name: string, email: string, password: string): User {
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.provider = null;
    user.providerId = null;
    user.isActivate = true;
    return user;
  }

  /**
   * OAuth 회원가입용 팩토리 메서드
   * @param name - 사용자 이름
   * @param email - 이메일
   * @param provider - OAuth 제공자 (google, kakao, naver 등)
   * @param providerId - OAuth 제공자의 사용자 ID
   * @returns User 인스턴스
   */
  static createWithOAuth(
    name: string,
    email: string,
    provider: string,
    providerId: string,
  ): User {
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = null;
    user.provider = provider;
    user.providerId = providerId;
    user.isActivate = true;
    return user;
  }
}
