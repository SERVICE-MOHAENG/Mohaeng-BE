import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModificationFieldsToItineraryJob1770600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. job_type 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        ADD COLUMN job_type ENUM('GENERATION', 'MODIFICATION') NOT NULL DEFAULT 'GENERATION' COMMENT '작업 유형: GENERATION, MODIFICATION' AFTER status
    `);

    // 2. intent_status 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        ADD COLUMN intent_status ENUM('SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED') NULL COMMENT 'Intent 분류 결과 (MODIFICATION 전용)' AFTER job_type
    `);

    // 3. diff_keys 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        ADD COLUMN diff_keys JSON NULL COMMENT '변경된 노드 ID 목록 (MODIFICATION 전용)' AFTER intent_status
    `);

    // 3.5. user_query 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        ADD COLUMN user_query TEXT NULL COMMENT '사용자 수정 요청 메시지 (MODIFICATION 전용)' AFTER diff_keys
    `);

    // 4. 복합 인덱스 추가 (travel_course_id, job_type, created_at)
    await queryRunner.query(`
      CREATE INDEX idx_itinerary_job_travel_course_type
        ON itinerary_job_table(travel_course_id, job_type, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 4. 인덱스 삭제
    await queryRunner.query(`
      DROP INDEX idx_itinerary_job_travel_course_type ON itinerary_job_table
    `);

    // 3.5. user_query 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        DROP COLUMN user_query
    `);

    // 3. diff_keys 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        DROP COLUMN diff_keys
    `);

    // 2. intent_status 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        DROP COLUMN intent_status
    `);

    // 1. job_type 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        DROP COLUMN job_type
    `);
  }
}
