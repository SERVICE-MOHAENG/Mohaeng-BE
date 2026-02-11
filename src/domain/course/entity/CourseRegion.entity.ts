import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { TravelCourse } from './TravelCourse.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * CourseRegion Entity
 * @description
 * - 여행 코스의 지역 및 기간 정보
 */
@Entity('travel_course_region')
export class CourseRegion {
  @PrimaryGeneratedColumn('uuid', { name: 'course_region_id' })
  id: string;

  @ManyToOne(() => TravelCourse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;

  @Column({ type: 'uuid', name: 'course_id' })
  travelCourseId: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'uuid', name: 'region_id' })
  regionId: string;

  @Column({ type: 'varchar', length: 100, name: 'region_name', nullable: false })
  regionName: string;

  @Column({ type: 'date', name: 'start_date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: false })
  endDate: Date;
}
