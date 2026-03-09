import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddModificationCountToTravelCoursePostgres
 * @description
 * - PR #181에서 MySQL 마이그레이션은 작성되었으나 Postgres 마이그레이션이 누락됨
 * - travel_course.modification_count 컬럼 추가 (AI 자연어 수정 요청 횟수, 최대 5회)
 * - 컬럼이 이미 존재하는 경우 skip (idempotent)
 */
export class AddModificationCountToTravelCoursePostgres1772600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const hasColumn = await this.columnExists(
      queryRunner,
      'travel_course',
      'modification_count',
    );

    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "travel_course"
        ADD COLUMN "modification_count" integer NOT NULL DEFAULT 0
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const hasColumn = await this.columnExists(
      queryRunner,
      'travel_course',
      'modification_count',
    );

    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "travel_course"
        DROP COLUMN "modification_count"
      `);
    }
  }

  private async columnExists(
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
