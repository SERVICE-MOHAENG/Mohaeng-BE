import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelCourse } from './TravelCourse.entity';

/**
 * CourseHashTag Entity
 * @description
 * - 여행 코스의 해시태그 엔티티
 * - 코스 검색 및 분류를 위한 태그 관리
 */
@Entity('course_hashtag_table')
export class CourseHashTag extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    name: 'tag_name',
    nullable: false,
  })
  tagName: string;

  @ManyToOne(() => TravelCourse, (course) => course.hashTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_course_id' })
  travelCourse: TravelCourse;

  /**
   * 코스 해시태그 생성 팩토리 메서드
   */
  static create(tagName: string, travelCourse: TravelCourse): CourseHashTag {
    const hashTag = new CourseHashTag();
    hashTag.tagName = tagName.startsWith('#') ? tagName : `#${tagName}`;
    hashTag.travelCourse = travelCourse;
    return hashTag;
  }
}
