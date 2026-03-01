import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsurePreferenceUuidDefaultsPostgres1772300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await this.setUuidDefaultIfTableExists(queryRunner, 'preference_job_table');
    await this.setUuidDefaultIfTableExists(
      queryRunner,
      'preference_recommendation_table',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.dropUuidDefaultIfTableExists(
      queryRunner,
      'preference_job_table',
    );
    await this.dropUuidDefaultIfTableExists(
      queryRunner,
      'preference_recommendation_table',
    );
  }

  private async setUuidDefaultIfTableExists(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  private async dropUuidDefaultIfTableExists(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "id" DROP DEFAULT`,
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
}
