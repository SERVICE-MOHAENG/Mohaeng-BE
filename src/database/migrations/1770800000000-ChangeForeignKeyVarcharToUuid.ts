import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeForeignKeyVarcharToUuid1770800000000
  implements MigrationInterface
{
  private readonly targets: Array<{ table: string; column: string }> = [
    { table: 'course_date', column: 'course_id' },
    { table: 'travel_course_region', column: 'course_id' },
    { table: 'travel_course_region', column: 'region_id' },
    { table: 'course_survey_table', column: 'user_id' },
    { table: 'course_survey_table', column: 'course_id' },
    { table: 'course_survey_companion', column: 'course_survay_id' },
    { table: 'course_survey_destination', column: 'course_survey_id' },
    { table: 'course_survey_destination', column: 'region_id' },
    { table: 'course_survey_theme', column: 'course_survay_id' },
    { table: 'roadmap_survey_table', column: 'user_id' },
    { table: 'roadmap_survey_table', column: 'travel_course_id' },
    { table: 'roadmap_survey_companion_table', column: 'survey_id' },
    { table: 'roadmap_survey_theme_table', column: 'survey_id' },
    { table: 'itinerary_job_table', column: 'user_id' },
    { table: 'itinerary_job_table', column: 'survey_id' },
    { table: 'user_preference', column: 'user_id' },
    { table: 'user_preference_budget', column: 'user_preference_id' },
    { table: 'user_preference_food_personality', column: 'user_preference_id' },
    { table: 'user_preference_main_interest', column: 'user_preference_id' },
    { table: 'user_preference_travel_range', column: 'user_preference_id' },
    { table: 'user_preference_travel_style', column: 'user_preference_id' },
    { table: 'user_preference_weather', column: 'user_preference_id' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    for (const target of this.targets) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = '${target.table}'
              AND column_name = '${target.column}'
              AND data_type <> 'uuid'
          ) THEN
            ALTER TABLE "${target.table}"
            ALTER COLUMN "${target.column}" TYPE uuid
            USING NULLIF("${target.column}", '')::uuid;
          END IF;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    for (const target of this.targets) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = '${target.table}'
              AND column_name = '${target.column}'
              AND data_type = 'uuid'
          ) THEN
            ALTER TABLE "${target.table}"
            ALTER COLUMN "${target.column}" TYPE varchar(36)
            USING "${target.column}"::text;
          END IF;
        END $$;
      `);
    }
  }
}
