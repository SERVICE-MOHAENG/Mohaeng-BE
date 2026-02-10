import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { CourseDay } from './CourseDay.entity';
import { Place } from '../../place/entity/Place.entity';

/**
 * CoursePlace Entity
 * @description
 * - 여행 코스의 장소 정보 엔티티
 * - 여행 코스에 포함된 장소와 방문 순서 관리
 */
@Entity('course_place_table')
export class CoursePlace extends BaseEntity {
  @Column({
    type: 'int',
    name: 'visit_order',
    nullable: false,
    comment: '방문 순서',
  })
  visitOrder: number;

  @Column({
    type: 'text',
    name: 'memo',
    nullable: true,
    comment: '장소 방문 메모',
  })
  memo: string | null;

  @ManyToOne(() => CourseDay, (courseDay) => courseDay.coursePlaces, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_day_id' })
  courseDay: CourseDay;

  @ManyToOne(() => Place, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: Place;

  /**
   * 코스 장소 생성 팩토리 메서드
   */
  static create(
    courseDay: CourseDay,
    place: Place,
    visitOrder: number,
    memo?: string,
  ): CoursePlace {
    const coursePlace = new CoursePlace();
    coursePlace.courseDay = courseDay;
    coursePlace.place = place;
    coursePlace.visitOrder = visitOrder;
    coursePlace.memo = memo || null;
    return coursePlace;
  }
}
