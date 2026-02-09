import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseDay } from './CourseDay.entity';
import { Place } from '../../place/entity/Place.entity';

/**
 * CoursePlace Entity
 * @description
 * - 여행 코스의 장소 정보 엔티티
 * - 여행 코스에 포함된 장소와 방문 순서 관리
 */
@Entity('course_place')
export class CoursePlace {
  @PrimaryGeneratedColumn('uuid', { name: 'course_place_id' })
  id: string;

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

  @Column({
    type: 'varchar',
    length: 5,
    name: 'visit_time',
    nullable: true,
    comment: '방문 시각 (HH:MM)',
  })
  visitTime: string | null;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '장소 한줄 설명',
  })
  description: string | null;

  @ManyToOne(() => CourseDay, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'date_id' })
  courseDay: CourseDay;

  @ManyToOne(() => Place, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id2', referencedColumnName: 'placeId' })
  place: Place;

  /**
   * 코스 장소 생성 팩토리 메서드
   */
  static create(
    courseDay: CourseDay,
    place: Place,
    visitOrder: number,
    memo?: string,
    visitTime?: string,
    description?: string,
  ): CoursePlace {
    const coursePlace = new CoursePlace();
    coursePlace.courseDay = courseDay;
    coursePlace.place = place;
    coursePlace.visitOrder = visitOrder;
    coursePlace.memo = memo || null;
    coursePlace.visitTime = visitTime || null;
    coursePlace.description = description || null;
    return coursePlace;
  }
}
