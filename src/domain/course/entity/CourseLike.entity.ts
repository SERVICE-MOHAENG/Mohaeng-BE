import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { User } from '../../user/entity/User.entity';

/**
 * CourseLike Entity
 * @description
 * - 여행 코스 좋아요 엔티티
 * - 사용자의 코스 좋아요 관리
 */
@Entity('course_like_table')
@Unique(['travelCourse', 'user'])
export class CourseLike extends BaseEntity {
  @ManyToOne(() => TravelCourse, (course) => course.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 코스 좋아요 생성 팩토리 메서드
   */
  static create(travelCourse: TravelCourse, user: User): CourseLike {
    const like = new CourseLike();
    like.travelCourse = travelCourse;
    like.user = user;
    return like;
  }
}
