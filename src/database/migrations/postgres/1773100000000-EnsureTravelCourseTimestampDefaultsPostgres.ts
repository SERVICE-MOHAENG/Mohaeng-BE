import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureTravelCourseTimestampDefaultsPostgres1773100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (!(await this.hasTable(queryRunner, 'travel_course'))) {
      return;
    }

    await this.setDefaultIfColumnExists(
      queryRunner,
      'travel_course',
      'created_at',
      'now()',
    );
    await this.setDefaultIfColumnExists(
      queryRunner,
      'travel_course',
      'updated_at',
      'now()',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (!(await this.hasTable(queryRunner, 'travel_course'))) {
      return;
    }

    await this.dropDefaultIfColumnExists(
      queryRunner,
      'travel_course',
      'created_at',
    );
    await this.dropDefaultIfColumnExists(
      queryRunner,
      'travel_course',
      'updated_at',
    );
  }

  private async setDefaultIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    defaultExpression: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${defaultExpression}`,
    );
  }

  private async dropDefaultIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT`,
    );
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
