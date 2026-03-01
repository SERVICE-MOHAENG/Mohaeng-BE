import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandCoursePlaceVisitTimeLengthPostgres1772400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (await this.hasColumn(queryRunner, 'course_place', 'visit_time')) {
      await queryRunner.query(
        `ALTER TABLE "course_place" ALTER COLUMN "visit_time" TYPE varchar(20)`,
      );
    }

    if (await this.hasColumn(queryRunner, 'course_place_table', 'visit_time')) {
      await queryRunner.query(
        `ALTER TABLE "course_place_table" ALTER COLUMN "visit_time" TYPE varchar(20)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (await this.hasColumn(queryRunner, 'course_place', 'visit_time')) {
      await queryRunner.query(
        `ALTER TABLE "course_place" ALTER COLUMN "visit_time" TYPE varchar(5) USING LEFT("visit_time", 5)`,
      );
    }

    if (await this.hasColumn(queryRunner, 'course_place_table', 'visit_time')) {
      await queryRunner.query(
        `ALTER TABLE "course_place_table" ALTER COLUMN "visit_time" TYPE varchar(5) USING LEFT("visit_time", 5)`,
      );
    }
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
