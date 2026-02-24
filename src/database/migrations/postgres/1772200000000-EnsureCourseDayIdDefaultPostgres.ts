import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureCourseDayIdDefaultPostgres1772200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const tableExists = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'course_day_table'
      LIMIT 1
      `,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `ALTER TABLE "course_day_table" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const tableExists = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'course_day_table'
      LIMIT 1
      `,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "course_day_table" ALTER COLUMN "id" DROP DEFAULT`,
    );
  }
}
