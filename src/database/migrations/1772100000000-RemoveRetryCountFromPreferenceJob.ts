import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * preference_job_table에서 retry_count 컬럼 제거
 * @description
 * - 202 응답 수신 후 재enqueue 로직 제거로 인해 불필요해진 컬럼
 * - 10분 타임아웃 시 바로 FAILED 처리 (itinerary_job_table과 동일한 방식)
 */
export class RemoveRetryCountFromPreferenceJob1772100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE preference_job_table
      DROP COLUMN retry_count
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE preference_job_table
      ADD COLUMN retry_count int NOT NULL DEFAULT 0 COMMENT 'FAILED 콜백 재시도 횟수 (최대 1회)'
    `);
  }
}
