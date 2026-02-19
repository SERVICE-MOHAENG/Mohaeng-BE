import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MySQL 스키마를 현재 엔티티 명명 규칙에 맞게 보정
 * @description
 * - legacy *_table 명명과 현재 엔티티 테이블명을 정렬
 * - legacy PK/조인 컬럼명을 현재 엔티티 컬럼명에 맞게 정렬
 * - 이미 반영된 경우 스킵 (idempotent)
 */
export class AlignMysqlSchemaWithEntities1771200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    await this.renameTableIfExists(queryRunner, 'place_table', 'place');
    await this.renameTableIfExists(
      queryRunner,
      'course_place_table',
      'course_place',
    );
    await this.renameTableIfExists(
      queryRunner,
      'course_survey_destination_table',
      'course_survey_destination',
    );
    await this.renameTableIfExists(
      queryRunner,
      'course_region_table',
      'travel_course_region',
    );

    await this.renameColumnIfExists(
      queryRunner,
      'course_place',
      'id',
      'course_place_id',
      'VARCHAR(36) NOT NULL',
    );

    await this.renameColumnIfExists(
      queryRunner,
      'travel_course_region',
      'id',
      'course_region_id',
      'VARCHAR(36) NOT NULL',
    );

    await this.addColumnIfMissing(
      queryRunner,
      'travel_course_region',
      'region_name',
      'VARCHAR(100) NULL',
    );
    await this.addColumnIfMissing(
      queryRunner,
      'travel_course_region',
      'start_date',
      'DATE NULL',
    );
    await this.addColumnIfMissing(
      queryRunner,
      'travel_course_region',
      'end_date',
      'DATE NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    await this.renameColumnIfExists(
      queryRunner,
      'course_place',
      'course_place_id',
      'id',
      'VARCHAR(36) NOT NULL',
    );

    await this.renameColumnIfExists(
      queryRunner,
      'travel_course_region',
      'course_region_id',
      'id',
      'VARCHAR(36) NOT NULL',
    );

    await this.renameTableIfExists(
      queryRunner,
      'travel_course_region',
      'course_region_table',
    );
    await this.renameTableIfExists(
      queryRunner,
      'course_survey_destination',
      'course_survey_destination_table',
    );
    await this.renameTableIfExists(queryRunner, 'course_place', 'course_place_table');
    await this.renameTableIfExists(queryRunner, 'place', 'place_table');
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

  private async renameTableIfExists(
    queryRunner: QueryRunner,
    from: string,
    to: string,
  ): Promise<void> {
    const fromExists = await this.hasTable(queryRunner, from);
    const toExists = await this.hasTable(queryRunner, to);

    if (!fromExists || toExists) {
      return;
    }

    await queryRunner.query(`RENAME TABLE \`${from}\` TO \`${to}\``);
  }

  private async renameColumnIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    from: string,
    to: string,
    columnDefinition: string,
  ): Promise<void> {
    const tableExists = await this.hasTable(queryRunner, tableName);
    if (!tableExists) {
      return;
    }

    const fromExists = await this.hasColumn(queryRunner, tableName, from);
    const toExists = await this.hasColumn(queryRunner, tableName, to);

    if (!fromExists || toExists) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`${tableName}\`
      CHANGE COLUMN \`${from}\` \`${to}\` ${columnDefinition}
    `);
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    columnDefinition: string,
  ): Promise<void> {
    const tableExists = await this.hasTable(queryRunner, tableName);
    if (!tableExists) {
      return;
    }

    const exists = await this.hasColumn(queryRunner, tableName, columnName);
    if (exists) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`${tableName}\`
      ADD COLUMN \`${columnName}\` ${columnDefinition}
    `);
  }
}
