import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PreferenceJob, PreferenceRecommendation 테이블 생성
 * @description
 * - preference_job_table: 여행지 추천 비동기 작업 추적
 * - preference_recommendation_table: Python LLM 추천 결과 저장
 */
export class CreatePreferenceJobAndRecommendationTables1771300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. preference_job_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE preference_job_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        user_id VARCHAR(36) NOT NULL,
        preference_id VARCHAR(36) NOT NULL,
        status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '작업 상태',
        error_code VARCHAR(50) NULL COMMENT '에러 코드',
        error_message TEXT NULL COMMENT '에러 메시지',
        retry_count INT NOT NULL DEFAULT 0 COMMENT 'FAILED 콜백 재시도 횟수 (최대 1회)',
        started_at DATETIME(6) NULL COMMENT '처리 시작 시각',
        completed_at DATETIME(6) NULL COMMENT '완료 시각',
        INDEX idx_preference_job_user_id (user_id),
        INDEX idx_preference_job_preference_id (preference_id),
        INDEX idx_preference_job_status (status),
        CONSTRAINT fk_preference_job_user FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_preference_job_preference FOREIGN KEY (preference_id) REFERENCES user_preference(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 2. preference_recommendation_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE preference_recommendation_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        job_id VARCHAR(36) NOT NULL,
        region_id VARCHAR(36) NULL COMMENT 'Region FK (DB에 없으면 null)',
        region_name VARCHAR(100) NOT NULL COMMENT '추천 여행지명 (Python 서버에서 받은 코드값)',
        INDEX idx_preference_recommendation_job_id (job_id),
        CONSTRAINT fk_preference_recommendation_job FOREIGN KEY (job_id) REFERENCES preference_job_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_preference_recommendation_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS preference_recommendation_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS preference_job_table`);
  }
}
