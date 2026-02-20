import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignPostgresLegacyNames1771310000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameTableIfNeeded(
      queryRunner,
      'place_table',
      'place',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_place_table',
      'course_place',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_destination_table',
      'course_survey_destination',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_companion_table',
      'course_survey_companion',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_theme_table',
      'course_survey_theme',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'place',
      'id',
      'place_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'place',
      'place_description',
      'description',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'id',
      'course_place_id',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'id',
      'course_survay_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_companion',
      'survey_id',
      'course_survay_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_theme',
      'survey_id',
      'course_survay_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_destination',
      'survey_id',
      'course_survey_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_destination',
      'course_survey_id',
      'survey_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_theme',
      'course_survay_id',
      'survey_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_companion',
      'course_survay_id',
      'survey_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'course_survay_id',
      'id',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'course_place_id',
      'id',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'place',
      'description',
      'place_description',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'place',
      'place_id',
      'id',
    );

    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_theme',
      'course_survey_theme_table',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_companion',
      'course_survey_companion_table',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_survey_destination',
      'course_survey_destination_table',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'course_place',
      'course_place_table',
    );
    await this.renameTableIfNeeded(
      queryRunner,
      'place',
      'place_table',
    );
  }

  private async renameTableIfNeeded(
    queryRunner: QueryRunner,
    from: string,
    to: string,
  ): Promise<void> {
    const hasFrom = await this.hasTable(queryRunner, from);
    const hasTo = await this.hasTable(queryRunner, to);

    if (hasFrom && !hasTo) {
      await queryRunner.query(
        `ALTER TABLE "${from}" RENAME TO "${to}"`,
      );
    }
  }

  private async renameColumnIfNeeded(
    queryRunner: QueryRunner,
    tableName: string,
    from: string,
    to: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    const hasFrom = await this.hasColumn(queryRunner, tableName, from);
    const hasTo = await this.hasColumn(queryRunner, tableName, to);

    if (hasFrom && !hasTo) {
      await queryRunner.query(
        `ALTER TABLE "${tableName}" RENAME COLUMN "${from}" TO "${to}"`,
      );
    }
  }

  private async hasTable(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
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
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
      `,
      [tableName, columnName],
    );

    return rows.length > 0;
  }
}
