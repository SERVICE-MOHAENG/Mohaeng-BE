import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTravelDateToCourseSurvey1770600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnsIfMissing(queryRunner, 'course_survey_table');
    await this.addColumnsIfMissing(queryRunner, 'roadmap_survey_table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropColumnsIfExists(queryRunner, 'course_survey_table');
    await this.dropColumnsIfExists(queryRunner, 'roadmap_survey_table');
  }

  private async hasTable(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
      LIMIT 1
      `,
      [tableName],
    );

    return rows.length > 0;
  }

  private async hasColumn(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
      `,
      [tableName, columnName],
    );

    return rows.length > 0;
  }

  private async addColumnsIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    const hasTravelStartDay = await this.hasColumn(
      queryRunner,
      tableName,
      'travel_start_day',
    );
    if (!hasTravelStartDay) {
      await queryRunner.query(`
        ALTER TABLE ${tableName}
          ADD COLUMN travel_start_day DATE NULL AFTER user_note
      `);
    }

    const hasTravelEndDay = await this.hasColumn(
      queryRunner,
      tableName,
      'travel_end_day',
    );
    if (!hasTravelEndDay) {
      await queryRunner.query(`
        ALTER TABLE ${tableName}
          ADD COLUMN travel_end_day DATE NULL AFTER travel_start_day
      `);
    }
  }

  private async dropColumnsIfExists(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    const hasTravelEndDay = await this.hasColumn(
      queryRunner,
      tableName,
      'travel_end_day',
    );
    if (hasTravelEndDay) {
      await queryRunner.query(`
        ALTER TABLE ${tableName}
          DROP COLUMN travel_end_day
      `);
    }

    const hasTravelStartDay = await this.hasColumn(
      queryRunner,
      tableName,
      'travel_start_day',
    );
    if (hasTravelStartDay) {
      await queryRunner.query(`
        ALTER TABLE ${tableName}
          DROP COLUMN travel_start_day
      `);
    }
  }
}
