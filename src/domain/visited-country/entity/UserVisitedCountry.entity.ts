import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';

/**
 * UserVisitedCountry Entity
 * @description
 * - 사용자가 방문한 국가 정보 엔티티
 * - 사용자의 여행 국가 히스토리 관리
 */
@Entity('user_visited_country_table')
@Unique(['user', 'country'])
export class UserVisitedCountry extends BaseEntity {
  @Column({
    type: 'date',
    name: 'visit_date',
    nullable: true,
    comment: '방문 날짜',
  })
  visitDate: Date | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Country, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  /**
   * 방문 국가 생성 팩토리 메서드
   */
  static create(
    user: User,
    country: Country,
    visitDate?: Date,
  ): UserVisitedCountry {
    const visitedCountry = new UserVisitedCountry();
    visitedCountry.user = user;
    visitedCountry.country = country;
    visitedCountry.visitDate = visitDate || null;
    return visitedCountry;
  }
}
