import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCompletedToTravelCourse1772900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
      ADD COLUMN is_completed boolean NOT NULL DEFAULT false
        COMMENT '여행 완료 여부'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
      DROP COLUMN is_completed
    `);
  }
}
