import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TravelCourse 테이블명 변경
 * @description
 * - travel_course_table → travel_course
 * - 엔티티 @Entity('travel_course')와 일관성 유지
 * - 이후 마이그레이션에서 travel_course 테이블명 사용
 */
export class RenameTravelCourseTable1770450000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `RENAME TABLE travel_course_table TO travel_course`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `RENAME TABLE travel_course TO travel_course_table`,
    );
  }
}
