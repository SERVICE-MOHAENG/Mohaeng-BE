import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCompletedToTravelCoursePostgres1772900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "travel_course"
      ADD COLUMN IF NOT EXISTS "is_completed" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "travel_course"."is_completed" IS '여행 완료 여부'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "travel_course"
      DROP COLUMN IF EXISTS "is_completed"
    `);
  }
}
