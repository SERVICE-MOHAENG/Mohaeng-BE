import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { User } from '../../user/entity/User.entity';

/**
 * CourseBookmark Entity
 * @description
 * - 여행 코스 북마크 엔티티
 * - 사용자의 코스 북마크(저장) 관리
 */
@Entity('course_bookmark_table')
@Unique(['travelCourse', 'user'])
export class CourseBookmark extends BaseEntity {
  @ManyToOne(() => TravelCourse, (course) => course.bookmarks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 코스 북마크 생성 팩토리 메서드
   */
  static create(travelCourse: TravelCourse, user: User): CourseBookmark {
    const bookmark = new CourseBookmark();
    bookmark.travelCourse = travelCourse;
    bookmark.user = user;
    return bookmark;
  }
}
