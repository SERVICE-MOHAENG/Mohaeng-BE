import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { CoursePlace } from './CoursePlace.entity';

/**
 * CourseDay Entity
 * @description
 * - 여행 코스 일차 엔티티
 * - TravelCourse와 N:1 관계
 * - CoursePlace와 1:N 관계
 */
@Entity('course_day_table')
@Unique(['travelCourse', 'dayNumber'])
export class CourseDay extends BaseEntity {
  @ManyToOne(() => TravelCourse, (course) => course.courseDays, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;

  @Column({
    type: 'int',
    name: 'day_number',
    nullable: false,
    comment: '몇 일차',
  })
  dayNumber: number;

  @Column({
    type: 'date',
    name: 'date',
    nullable: false,
    comment: '해당 일차 날짜',
  })
  date: Date;

  @OneToMany(() => CoursePlace, (coursePlace) => coursePlace.courseDay, {
    cascade: true,
  })
  coursePlaces: CoursePlace[];

  /**
   * 팩토리 메서드
   */
  static create(
    travelCourse: TravelCourse,
    dayNumber: number,
    date: Date,
  ): CourseDay {
    const courseDay = new CourseDay();
    courseDay.travelCourse = travelCourse;
    courseDay.dayNumber = dayNumber;
    courseDay.date = date;
    courseDay.coursePlaces = [];
    return courseDay;
  }
}
