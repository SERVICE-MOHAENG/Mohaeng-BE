import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Provider } from './Provider.enum';
import { UserPreference } from '../../preference/entity/UserPreference.entity';

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
    type: 'varchar',
    length: 500,
    name: 'profile_image',
    nullable: true,
    comment: '프로필 이미지 URL',
  })
  profileImage: string | null;

  @Column({
    type: 'int',
    name: 'visited_countries',
    nullable: false,
    default: 0,
    comment: '방문한 국가 수',
  })
  visitedCountries: number;

  @Column({
    type: 'boolean',
    name: 'is_activate',
    nullable: false,
    default: true,
  })
  isActivate: boolean;

  @OneToOne(() => UserPreference, (preference) => preference.user)
  preference: UserPreference;

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
    user.profileImage = null;
    user.visitedCountries = 0;
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
    profileImage?: string,
  ): User {
    const user = new User();
    user.name = name;
    user.email = email;
    user.passwordHash = null;
    user.provider = provider;
    user.providerId = providerId;
    user.profileImage = profileImage || null;
    user.visitedCountries = 0;
    user.isActivate = true;
    return user;
  }

  /**
   * 방문 국가 수 증가
   */
  incrementVisitedCountries(): void {
    this.visitedCountries += 1;
  }

  /**
   * 방문 국가 수 감소
   */
  decrementVisitedCountries(): void {
    if (this.visitedCountries > 0) {
      this.visitedCountries -= 1;
    }
  }
}
