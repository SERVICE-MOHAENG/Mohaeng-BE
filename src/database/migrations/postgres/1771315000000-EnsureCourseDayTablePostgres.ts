import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureCourseDayTablePostgres1771315000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameTableIfNeeded(queryRunner, 'course_day', 'course_day_table');
    await this.createCourseDayTableIfMissing(queryRunner);
    await this.renameColumnIfNeeded(queryRunner, 'course_day_table', 'day_id', 'id');
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_day_table',
      'travel_course_id',
      'course_id',
    );

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'day_id',
      'course_day_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'course_day_id',
      'day_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_day_table',
      'course_id',
      'travel_course_id',
    );
    await this.renameColumnIfNeeded(queryRunner, 'course_day_table', 'id', 'day_id');
    await this.renameTableIfNeeded(queryRunner, 'course_day_table', 'course_day');
  }

  private async createCourseDayTableIfMissing(
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (await this.hasTable(queryRunner, 'course_day_table')) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "course_day_table" (
        "id" uuid PRIMARY KEY,
        "course_id" uuid NOT NULL,
        "day_number" integer NOT NULL,
        "date" date NOT NULL
      )
    `);
  }

  private async renameTableIfNeeded(
    queryRunner: QueryRunner,
    from: string,
    to: string,
  ): Promise<void> {
    const hasFrom = await this.hasTable(queryRunner, from);
    const hasTo = await this.hasTable(queryRunner, to);
    if (hasFrom && !hasTo) {
      await queryRunner.query(`ALTER TABLE "${from}" RENAME TO "${to}"`);
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
