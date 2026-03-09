import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceCourseIdToTravelCoursePostgres1772700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "travel_course"
      ADD COLUMN IF NOT EXISTS "source_course_id" uuid NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "travel_course"."source_course_id" IS '복사 원본 코스 ID'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "travel_course"
      DROP COLUMN IF EXISTS "source_course_id"
    `);
  }
}
