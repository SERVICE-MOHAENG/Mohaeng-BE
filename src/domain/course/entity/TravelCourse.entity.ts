import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/User.entity';
import { Country } from '../../country/entity/Country.entity';
import { CourseHashTag } from './CourseHashTag.entity';
import { CourseLike } from './CourseLike.entity';
import { CourseCountry } from './CourseCountry.entity';
import { CourseDay } from './CourseDay.entity';
import { CourseRegion } from './CourseRegion.entity';

/**
 * TravelCourse Entity
 * @description
 * - 여행 코스 정보 엔티티
 * - 사용자가 생성한 여행 경로 및 일정 관리
 */
@Entity('travel_course')
export class TravelCourse {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'title',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'course_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'int',
    name: 'view_count',
    nullable: false,
    default: 0,
    comment: '조회수',
  })
  viewCount: number;

  @Column({
    type: 'int',
    name: 'nights',
    nullable: false,
    comment: '숙박 일수 (몇 박)',
  })
  nights: number;

  @Column({
    type: 'int',
    name: 'days',
    nullable: false,
    comment: '여행 일수 (몇 일)',
  })
  days: number;

  @Column({
    type: 'int',
    name: 'people_count',
    nullable: false,
    default: 1,
    comment: '총 여행 인원 수',
  })
  peopleCount: number;

  @Column({
    type: 'date',
    name: 'travel_start_day',
    nullable: false,
  })
  travelStartDay: Date;

  @Column({
    type: 'date',
    name: 'travel_finish_day',
    nullable: false,
  })
  travelFinishDay: Date;

  @Column({
    type: 'boolean',
    name: 'is_public',
    nullable: false,
    default: true,
    comment: '공개 여부',
  })
  isPublic: boolean;

  @Column({
    type: 'boolean',
    name: 'is_completed',
    nullable: false,
    default: false,
    comment: '여행 완료 여부',
  })
  isCompleted: boolean;

  @Column({
    type: 'int',
    name: 'like_count',
    nullable: false,
    default: 0,
    comment: '좋아요 수',
  })
  likeCount: number;

  @Column({
    type: 'int',
    name: 'modification_count',
    nullable: false,
    default: 0,
    comment: 'AI 자연어 수정 요청 횟수 (최대 5회)',
  })
  modificationCount: number;

  @Column({
    type: 'uuid',
    name: 'source_course_id',
    nullable: true,
    comment: '복사 원본 코스 ID',
  })
  sourceCourseId: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => CourseCountry,
    (courseCountry) => courseCountry.travelCourse,
    {
      cascade: true,
    },
  )
  courseCountries: CourseCountry[];

  @OneToMany(() => CourseRegion, (courseRegion) => courseRegion.travelCourse)
  courseRegions: CourseRegion[];

  @OneToMany(() => CourseDay, (courseDay) => courseDay.travelCourse)
  courseDays: CourseDay[];

  @OneToMany(() => CourseHashTag, (hashTag) => hashTag.travelCourse)
  hashTags: CourseHashTag[];

  @OneToMany(() => CourseLike, (like) => like.travelCourse)
  likes: CourseLike[];

  /**
   * 여행 코스 생성 팩토리 메서드
   */
  static create(
    title: string,
    user: User,
    nights: number,
    days: number,
    description?: string,
    imageUrl?: string,
    isPublic: boolean = true,
    countries?: Country[],
  ): TravelCourse {
    const course = new TravelCourse();
    course.title = title;
    course.user = user;
    course.nights = nights;
    course.days = days;
    course.peopleCount = 1;
    course.description = description || null;
    course.imageUrl = imageUrl || null;
    course.isPublic = isPublic;
    course.isCompleted = false;
    course.viewCount = 0;
    course.likeCount = 0;
    course.modificationCount = 0;
    const now = new Date();
    course.createdAt = now;
    course.updatedAt = now;
    course.travelStartDay = now;
    course.travelFinishDay = now;
    course.courseCountries = (countries || []).map((country) =>
      CourseCountry.create(course, country),
    );
    return course;
  }

  incrementViewCount(): void {
    this.viewCount += 1;
  }

  incrementLikeCount(): void {
    this.likeCount += 1;
  }

  decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount -= 1;
    }
  }

  /**
   * AI 자연어 수정 횟수 증가
   * @returns 증가 후 횟수
   */
  incrementModificationCount(): number {
    this.modificationCount += 1;
    return this.modificationCount;
  }

  /**
   * 자연어 수정 가능 여부 확인 (최대 5회)
   */
  canModify(): boolean {
    return this.modificationCount < 5;
  }
}
