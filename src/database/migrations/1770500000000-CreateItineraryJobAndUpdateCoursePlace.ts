import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItineraryJobAndUpdateCoursePlace1770500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. itinerary_job_table 생성
    await queryRunner.query(`
      CREATE TABLE itinerary_job_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '작업 상태',
        user_id VARCHAR(36) NOT NULL,
        survey_id VARCHAR(36) NOT NULL,
        travel_course_id VARCHAR(36) NULL,
        attempt_count INT NOT NULL DEFAULT 0 COMMENT '시도 횟수',
        error_code VARCHAR(50) NULL COMMENT '에러 코드',
        error_message TEXT NULL COMMENT '에러 메시지',
        llm_commentary TEXT NULL COMMENT 'LLM이 생성한 코멘터리 (코스 선정 이유)',
        next_action_suggestions JSON NULL COMMENT 'LLM이 제안하는 다음 행동 목록',
        started_at TIMESTAMP NULL COMMENT '처리 시작 시각',
        completed_at TIMESTAMP NULL COMMENT '완료 시각',
        UNIQUE KEY uq_itinerary_job_survey (survey_id),
        INDEX idx_itinerary_job_user (user_id),
        INDEX idx_itinerary_job_status (status),
        CONSTRAINT fk_itinerary_job_user FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_itinerary_job_survey FOREIGN KEY (survey_id) REFERENCES course_survey_table(course_survay_id) ON DELETE CASCADE,
        CONSTRAINT fk_itinerary_job_course FOREIGN KEY (travel_course_id) REFERENCES travel_course(course_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 2. course_place_table에 visit_time, description 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE course_place
        ADD COLUMN visit_time VARCHAR(5) NULL COMMENT '방문 시각 (HH:MM)' AFTER memo,
        ADD COLUMN description TEXT NULL COMMENT '장소 한줄 설명' AFTER visit_time
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 2. course_place_table에서 추가 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE course_place
        DROP COLUMN description,
        DROP COLUMN visit_time
    `);

    // 1. itinerary_job_table 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS itinerary_job_table`);
  }
}
