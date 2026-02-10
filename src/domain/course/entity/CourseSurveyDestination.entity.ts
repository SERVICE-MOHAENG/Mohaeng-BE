import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoadmapSurvey } from './RoadmapSurvey.entity';
import { Region } from '../../country/entity/Region.entity';

/**
 * CourseSurveyDestination Entity
 * @description
 * - 코스 설문 목적지 매핑 테이블
 * - RoadmapSurvey와 Region의 N:M 관계
 * - 도시별 여행 날짜 포함
 */
@Entity('course_survey_destination_table')
export class CourseSurveyDestination {
  @PrimaryGeneratedColumn('uuid', { name: 'destination_id' })
  destinationId: string;

  @ManyToOne(() => RoadmapSurvey, (survey) => survey.destinations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_survey_id' })
  survey: RoadmapSurvey;

  @Column({ type: 'varchar', length: 36, name: 'course_survey_id' })
  courseSurveyId: string;

  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'varchar', length: 36, name: 'region_id' })
  regionId: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'region_name',
    nullable: false,
  })
  regionName: string;

  @Column({
    type: 'date',
    name: 'start_day',
    nullable: false,
    comment: '해당 도시 여행 시작일',
  })
  startDay: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: false,
    comment: '해당 도시 여행 종료일',
  })
  endDate: Date;

  /**
   * 팩토리 메서드
   */
  static create(
    courseSurveyId: string,
    regionId: string,
    regionName: string,
    startDay: Date,
    endDate: Date,
  ): CourseSurveyDestination {
    const destination = new CourseSurveyDestination();
    destination.courseSurveyId = courseSurveyId;
    destination.regionId = regionId;
    destination.regionName = regionName;
    destination.startDay = startDay;
    destination.endDate = endDate;
    return destination;
  }
}
