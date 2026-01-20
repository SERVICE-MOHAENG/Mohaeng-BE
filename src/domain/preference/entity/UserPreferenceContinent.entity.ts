import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { UserPreference } from './UserPreference.entity';
import { Continent } from './Continent.enum';

/**
 * UserPreferenceContinent Entity
 * @description
 * - 사용자 선호 대륙 매핑 테이블
 * - UserPreference와 N:1 관계
 */
@Entity('user_preference_continent')
export class UserPreferenceContinent extends BaseEntity {
  @ManyToOne(() => UserPreference, (preference) => preference.continents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_preference_id' })
  preference: UserPreference;

  @Column({ type: 'varchar', length: 36, name: 'user_preference_id' })
  userPreferenceId: string;

  @Column({
    type: 'enum',
    enum: Continent,
    name: 'continent',
    nullable: false,
  })
  continent: Continent;

  /**
   * 팩토리 메서드
   */
  static create(
    userPreferenceId: string,
    continent: Continent,
  ): UserPreferenceContinent {
    const entity = new UserPreferenceContinent();
    entity.userPreferenceId = userPreferenceId;
    entity.continent = continent;
    return entity;
  }
}
