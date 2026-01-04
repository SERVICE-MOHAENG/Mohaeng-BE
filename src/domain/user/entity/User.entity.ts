import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Provider } from './Provider.enum';

/**
 * User Entity
 * @description
 * - 사용자 정보 엔티티
 * - 일반 회원가입 및 OAuth 로그인 지원
 */
@Entity('user_table')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, name: 'name', nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'email',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'provider',
    nullable: false,
    default: Provider.LOCAL,
  })
  provider: Provider;

  @Column({ type: 'varchar', length: 255, name: 'provider_id', nullable: true })
  providerId: string | null;

  @Column({
    type: 'boolean',
    name: 'is_activate',
    nullable: false,
    default: true,
  })
  isActivate: boolean;

  /**
   * 일반 회원가입용 팩토리 메서드
   */
  static create(name: string, email: string, passwordHash: string): User {
    const user = new User();
    user.name = name;
    user.email = email;
    user.passwordHash = passwordHash;
    user.provider = Provider.LOCAL;
    user.providerId = null;
    user.isActivate = true;
    return user;
  }

  /**
   * OAuth 회원가입용 팩토리 메서드
   */
  static createWithOAuth(
    name: string,
    email: string,
    provider: Provider,
    providerId: string,
  ): User {
    const user = new User();
    user.name = name;
    user.email = email;
    user.passwordHash = null;
    user.provider = provider;
    user.providerId = providerId;
    user.isActivate = true;
    return user;
  }
}
