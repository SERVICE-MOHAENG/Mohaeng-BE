import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * itinerary_job_table 수정 작업 컬럼 보정
 * @description
 * - 로컬 DB 이력 불일치로 누락된 컬럼/인덱스를 안전하게 복구
 * - 이미 존재하면 스킵 (idempotent)
 */
export class EnsureItineraryModificationColumns1771000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    await this.addColumnIfMissing(
      queryRunner,
      'job_type',
      "ENUM('GENERATION', 'MODIFICATION') NOT NULL DEFAULT 'GENERATION' COMMENT '작업 유형: GENERATION, MODIFICATION' AFTER status",
    );

    await this.addColumnIfMissing(
      queryRunner,
      'intent_status',
      "ENUM('SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED') NULL COMMENT 'Intent 분류 결과 (MODIFICATION 전용)' AFTER job_type",
    );

    await this.addColumnIfMissing(
      queryRunner,
      'diff_keys',
      "JSON NULL COMMENT '변경된 노드 ID 목록 (MODIFICATION 전용)' AFTER intent_status",
    );

    await this.addColumnIfMissing(
      queryRunner,
      'user_query',
      "TEXT NULL COMMENT '사용자 수정 요청 메시지 (MODIFICATION 전용)' AFTER diff_keys",
    );

    const idxRows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'itinerary_job_table'
        AND index_name = 'idx_itinerary_job_travel_course_type'
      LIMIT 1
      `,
    );

    if (idxRows.length === 0) {
      await queryRunner.query(`
        CREATE INDEX idx_itinerary_job_travel_course_type
        ON itinerary_job_table(travel_course_id, job_type, created_at DESC)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const idxRows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'itinerary_job_table'
        AND index_name = 'idx_itinerary_job_travel_course_type'
      LIMIT 1
      `,
    );

    if (idxRows.length > 0) {
      await queryRunner.query(`
        DROP INDEX idx_itinerary_job_travel_course_type ON itinerary_job_table
      `);
    }

    await this.dropColumnIfExists(queryRunner, 'user_query');
    await this.dropColumnIfExists(queryRunner, 'diff_keys');
    await this.dropColumnIfExists(queryRunner, 'intent_status');
    await this.dropColumnIfExists(queryRunner, 'job_type');
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    columnName: string,
    definitionSql: string,
  ): Promise<void> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'itinerary_job_table'
        AND column_name = ?
      LIMIT 1
      `,
      [columnName],
    );

    if (rows.length === 0) {
      await queryRunner.query(`
        ALTER TABLE itinerary_job_table
        ADD COLUMN ${columnName} ${definitionSql}
      `);
    }
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    columnName: string,
  ): Promise<void> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'itinerary_job_table'
        AND column_name = ?
      LIMIT 1
      `,
      [columnName],
    );

    if (rows.length > 0) {
      await queryRunner.query(`
        ALTER TABLE itinerary_job_table
        DROP COLUMN ${columnName}
      `);
    }
  }
}
