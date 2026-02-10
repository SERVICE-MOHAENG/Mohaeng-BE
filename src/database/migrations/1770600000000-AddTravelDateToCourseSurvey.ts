import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTravelDateToCourseSurvey1770600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE course_survey_table
        ADD COLUMN travel_start_day DATE NULL AFTER user_note,
        ADD COLUMN travel_end_day DATE NULL AFTER travel_start_day
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE course_survey_table
        DROP COLUMN travel_end_day,
        DROP COLUMN travel_start_day
    `);
  }
}
