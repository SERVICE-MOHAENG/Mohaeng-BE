import { MigrationInterface, QueryRunner } from 'typeorm';

type ColumnMetadataRow = {
  TABLE_NAME?: string;
  table_name?: string;
  COLUMN_NAME?: string;
  column_name?: string;
  COLUMN_TYPE?: string;
  column_type?: string;
};

/**
 * created_at / updated_at 기본값 보정
 *
 * 목적:
 * - 과거 마이그레이션으로 생성된 MySQL 테이블 중
 *   created_at/updated_at이 NOT NULL인데 DEFAULT가 없는 컬럼을 보정
 * - OAuth/일반 회원가입 등 INSERT 시 "created_at doesn't have a default value" 방지
 */
export class EnsureAuditTimestampDefaults1771100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const rows = (await queryRunner.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND COLUMN_NAME IN ('created_at', 'updated_at')
        AND IS_NULLABLE = 'NO'
        AND COLUMN_DEFAULT IS NULL
        AND DATA_TYPE IN ('datetime', 'timestamp')
    `)) as ColumnMetadataRow[];

    const groupedByTable = new Map<
      string,
      Partial<Record<'created_at' | 'updated_at', string>>
    >();

    for (const row of rows) {
      const tableName = row.TABLE_NAME ?? row.table_name;
      const columnNameRaw = row.COLUMN_NAME ?? row.column_name;
      const columnType = row.COLUMN_TYPE ?? row.column_type;

      if (!tableName || !columnNameRaw || !columnType) {
        continue;
      }

      const columnName = columnNameRaw as 'created_at' | 'updated_at';
      const prev = groupedByTable.get(tableName) ?? {};
      prev[columnName] = columnType;
      groupedByTable.set(tableName, prev);
    }

    for (const [tableName, columns] of groupedByTable) {
      // Place처럼 updated_at만 있는 테이블은 제외하여 의도치 않은 자동 갱신 부작용 방지
      if (!columns.created_at) {
        continue;
      }

      const createdType = columns.created_at;
      if (createdType) {
        const createdNowExpr = createdType.includes('(6)')
          ? 'CURRENT_TIMESTAMP(6)'
          : 'CURRENT_TIMESTAMP';

        await queryRunner.query(`
          ALTER TABLE \`${tableName}\`
          MODIFY COLUMN \`created_at\` ${createdType} NOT NULL DEFAULT ${createdNowExpr}
        `);
      }

      const updatedType = columns.updated_at;
      if (updatedType) {
        const updatedNowExpr = updatedType.includes('(6)')
          ? 'CURRENT_TIMESTAMP(6)'
          : 'CURRENT_TIMESTAMP';

        await queryRunner.query(`
          ALTER TABLE \`${tableName}\`
          MODIFY COLUMN \`updated_at\` ${updatedType} NOT NULL DEFAULT ${updatedNowExpr} ON UPDATE ${updatedNowExpr}
        `);
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // 스키마 안정성 및 역추적 불가능성(기존 default 상태 미보존)으로 인해 no-op 처리
  }
}
