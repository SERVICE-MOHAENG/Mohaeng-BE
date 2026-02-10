import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTravelCourseStartAndFinishDay1769100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // travel_course_table: travel_start_day, travel_finish_day 컬럼 추가
    // =============================================
    await queryRunner.query(`
      ALTER TABLE travel_course_table
      ADD COLUMN travel_start_day DATE NOT NULL COMMENT '여행 시작일'
    `);

    await queryRunner.query(`
      ALTER TABLE travel_course_table
      ADD COLUMN travel_finish_day DATE NOT NULL COMMENT '여행 종료일'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // travel_course_table: travel_start_day, travel_finish_day 컬럼 삭제
    // =============================================
    await queryRunner.query(`
      ALTER TABLE travel_course_table
      DROP COLUMN travel_finish_day
    `);

    await queryRunner.query(`
      ALTER TABLE travel_course_table
      DROP COLUMN travel_start_day
    `);
  }
}