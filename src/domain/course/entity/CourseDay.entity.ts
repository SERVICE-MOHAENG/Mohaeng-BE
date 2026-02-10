import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TravelCourse } from './TravelCourse.entity';
import { CoursePlace } from './CoursePlace.entity';

/**
 * CourseDay Entity
 * @description
 * - 여행 코스 날짜 정보
 */
@Entity('course_date')
export class CourseDay {
  @PrimaryGeneratedColumn('uuid', { name: 'date_id' })
  id: string;

  @ManyToOne(() => TravelCourse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;

  @Column({ type: 'varchar', length: 36, name: 'course_id' })
  travelCourseId: string;

  @Column({ type: 'int', name: 'day_number', nullable: false })
  dayNumber: number;

  @Column({ type: 'date', name: 'date', nullable: false })
  date: Date;

  @OneToMany(() => CoursePlace, (coursePlace) => coursePlace.courseDay)
  coursePlaces: CoursePlace[];

  static create(travelCourse: TravelCourse, dayNumber: number, date: Date): CourseDay {
    const courseDay = new CourseDay();
    courseDay.travelCourse = travelCourse;
    courseDay.dayNumber = dayNumber;
    courseDay.date = date;
    return courseDay;
  }
}
