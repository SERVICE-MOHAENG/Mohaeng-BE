import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBudgetFromSurveyTablesPostgres1773500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "course_survey_table"
      DROP COLUMN IF EXISTS "budget"
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "roadmap_survey_table"
      DROP COLUMN IF EXISTS "budget"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'course_survey_table_budget_enum'
        ) THEN
          CREATE TYPE "course_survey_table_budget_enum" AS ENUM ('LOW', 'MID', 'HIGH', 'LUXURY');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "course_survey_table"
      ADD COLUMN IF NOT EXISTS "budget" "course_survey_table_budget_enum" NOT NULL DEFAULT 'MID'
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'roadmap_survey_table_budget_enum'
        ) THEN
          CREATE TYPE "roadmap_survey_table_budget_enum" AS ENUM ('LOW', 'MID', 'HIGH', 'LUXURY');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "roadmap_survey_table"
      ADD COLUMN IF NOT EXISTS "budget" "roadmap_survey_table_budget_enum" NOT NULL DEFAULT 'MID'
    `);
  }
}
