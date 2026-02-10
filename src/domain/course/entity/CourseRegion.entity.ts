import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * CourseRegion Entity
 * @description
 * - 여행 코스와 지역의 다대다 매핑 엔티티
 */
@Entity('course_region_table')
@Unique(['travelCourse', 'region'])
export class CourseRegion extends BaseEntity {
  @ManyToOne(() => TravelCourse, (course) => course.courseRegions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  /**
   * 코스-지역 매핑 생성 팩토리 메서드
   */
  static create(travelCourse: TravelCourse, region: Region): CourseRegion {
    const mapping = new CourseRegion();
    mapping.travelCourse = travelCourse;
    mapping.region = region;
    return mapping;
  }
}