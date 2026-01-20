import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { Environment } from './Environment.enum';

/**
 * UserPreferenceEnvironment Entity
 * @description
 * - 사용자 선호 환경 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_environment')
export class UserPreferenceEnvironment extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.environments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'varchar', length: 36, name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: Environment,
    name: 'environment',
    nullable: false,
  })
  environment: Environment;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    environment: Environment,
  ): UserPreferenceEnvironment {
    const entity = new UserPreferenceEnvironment();
    entity.userPreferenceId = userPreferenceId;
    entity.environment = environment;
    return entity;
  }
}
