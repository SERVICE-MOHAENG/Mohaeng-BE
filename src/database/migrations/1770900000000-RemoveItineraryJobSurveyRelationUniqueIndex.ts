import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * itinerary_job_table.survey_id REL 유니크 인덱스 정리
 * @description
 * - 과거 OneToOne 스키마에서 생성된 REL_904... 유니크 인덱스를 제거
 * - 현재 ManyToOne 관계에 맞게 일반 인덱스(idx_itinerary_job_survey)로 전환
 * - FK 의존성이 있는 인덱스이므로 FK를 먼저 분리 후 재생성
 */
export class RemoveItineraryJobSurveyRelationUniqueIndex1770900000000
  implements MigrationInterface
{
  private readonly tableName = 'itinerary_job_table';
  private readonly columnName = 'survey_id';
  private readonly relationUniqueIndex = 'REL_904c1d86d75f038788d730c846';
  private readonly normalIndex = 'idx_itinerary_job_survey';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const relIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.relationUniqueIndex],
    );

    if (relIndex.length === 0) {
      return;
    }

    const fkRows = await queryRunner.query(
      `
      SELECT
        k.CONSTRAINT_NAME AS constraintName,
        k.REFERENCED_TABLE_NAME AS referencedTableName,
        k.REFERENCED_COLUMN_NAME AS referencedColumnName,
        r.UPDATE_RULE AS updateRule,
        r.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.TABLE_NAME = k.TABLE_NAME
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.TABLE_NAME = ?
        AND k.COLUMN_NAME = ?
        AND k.REFERENCED_TABLE_NAME IS NOT NULL
      `,
      [this.tableName, this.columnName],
    );

    for (const fk of fkRows) {
      await queryRunner.query(
        `ALTER TABLE \`${this.tableName}\` DROP FOREIGN KEY \`${fk.constraintName}\``,
      );
    }

    const normalIdx = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.normalIndex],
    );

    if (normalIdx.length === 0) {
      await queryRunner.query(
        `CREATE INDEX \`${this.normalIndex}\` ON \`${this.tableName}\`(\`${this.columnName}\`)`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE \`${this.tableName}\` DROP INDEX \`${this.relationUniqueIndex}\``,
    );

    for (const fk of fkRows) {
      await queryRunner.query(
        `
        ALTER TABLE \`${this.tableName}\`
        ADD CONSTRAINT \`${fk.constraintName}\`
        FOREIGN KEY (\`${this.columnName}\`)
        REFERENCES \`${fk.referencedTableName}\`(\`${fk.referencedColumnName}\`)
        ON DELETE ${fk.deleteRule}
        ON UPDATE ${fk.updateRule}
        `,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const relIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.relationUniqueIndex],
    );

    if (relIndex.length > 0) {
      return;
    }

    const fkRows = await queryRunner.query(
      `
      SELECT
        k.CONSTRAINT_NAME AS constraintName,
        k.REFERENCED_TABLE_NAME AS referencedTableName,
        k.REFERENCED_COLUMN_NAME AS referencedColumnName,
        r.UPDATE_RULE AS updateRule,
        r.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.TABLE_NAME = k.TABLE_NAME
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.TABLE_NAME = ?
        AND k.COLUMN_NAME = ?
        AND k.REFERENCED_TABLE_NAME IS NOT NULL
      `,
      [this.tableName, this.columnName],
    );

    for (const fk of fkRows) {
      await queryRunner.query(
        `ALTER TABLE \`${this.tableName}\` DROP FOREIGN KEY \`${fk.constraintName}\``,
      );
    }

    const normalIdx = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.normalIndex],
    );

    if (normalIdx.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`${this.tableName}\` DROP INDEX \`${this.normalIndex}\``,
      );
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX \`${this.relationUniqueIndex}\` ON \`${this.tableName}\`(\`${this.columnName}\`)`,
    );

    for (const fk of fkRows) {
      await queryRunner.query(
        `
        ALTER TABLE \`${this.tableName}\`
        ADD CONSTRAINT \`${fk.constraintName}\`
        FOREIGN KEY (\`${this.columnName}\`)
        REFERENCES \`${fk.referencedTableName}\`(\`${fk.referencedColumnName}\`)
        ON DELETE ${fk.deleteRule}
        ON UPDATE ${fk.updateRule}
        `,
      );
    }
  }
}
