import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';
import { Country } from '../../country/entity/Country.entity';

/**
 * CourseCountry Entity
 * @description
 * - 여행 코스와 국가의 다대다 매핑 엔티티
 */
@Entity('course_country_table')
@Unique(['travelCourse', 'country'])
export class CourseCountry extends BaseEntity {
  @ManyToOne(() => TravelCourse, (course) => course.courseCountries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  travelCourse: TravelCourse;

  @ManyToOne(() => Country, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  /**
   * 코스-국가 매핑 생성 팩토리 메서드
   */
  static create(travelCourse: TravelCourse, country: Country): CourseCountry {
    const mapping = new CourseCountry();
    mapping.travelCourse = travelCourse;
    mapping.country = country;
    return mapping;
  }
}
