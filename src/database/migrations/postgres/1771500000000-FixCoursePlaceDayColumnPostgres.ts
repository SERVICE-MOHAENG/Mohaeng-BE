import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCoursePlaceDayColumnPostgres1771500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameTableIfNeeded(queryRunner, 'course_place_table', 'course_place');
    await this.renameTableIfNeeded(queryRunner, 'course_day', 'course_day_table');

    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'day_id',
      'course_day_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'date_id',
      'course_day_id',
    );
    await this.renameColumnIfNeeded(
      queryRunner,
      'course_place',
      'place_id2',
      'place_id',
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
      'course_place',
      'place_id',
      'place_id2',
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
