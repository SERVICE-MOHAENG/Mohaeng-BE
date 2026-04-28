import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBudgetFromSurveyTables1773500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      DROP COLUMN budget
    `);

    await queryRunner.query(`
      ALTER TABLE roadmap_survey_table
      DROP COLUMN budget
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      ADD COLUMN budget ENUM('LOW', 'MID', 'HIGH', 'LUXURY') NOT NULL DEFAULT 'MID' COMMENT '예산 범위'
    `);

    await queryRunner.query(`
      ALTER TABLE roadmap_survey_table
      ADD COLUMN budget ENUM('LOW', 'MID', 'HIGH', 'LUXURY') NOT NULL DEFAULT 'MID' COMMENT '예산 범위'
    `);
  }
}
