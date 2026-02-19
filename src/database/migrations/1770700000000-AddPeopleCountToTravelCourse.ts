import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeopleCountToTravelCourse1770700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const hasColumn = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'travel_course'
        AND column_name = 'people_count'
      LIMIT 1
      `,
    );

    if (hasColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE travel_course
          ADD COLUMN people_count INT NOT NULL DEFAULT 1 COMMENT '총 여행 인원 수' AFTER days
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const hasColumn = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'travel_course'
        AND column_name = 'people_count'
      LIMIT 1
      `,
    );

    if (hasColumn.length > 0) {
      await queryRunner.query(`
        ALTER TABLE travel_course
          DROP COLUMN people_count
      `);
    }
  }
}
