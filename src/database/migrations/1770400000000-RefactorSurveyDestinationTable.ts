import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * roadmap_survey_destination_table → course_survey_destination_table 재구성
 * @description
 * - 테이블명 변경: roadmap_survey_destination_table → course_survey_destination_table
 * - PK 컬럼명 변경: id → destination_id
 * - FK 컬럼명 변경: survey_id → course_survey_id
 * - 컬럼 추가: region_name VARCHAR(100) NOT NULL
 * - 컬럼명 변경: start_date → start_day
 * - 컬럼 삭제: created_at, updated_at
 *
 * 비가역 마이그레이션: 테이블 DROP 후 재생성으로 기존 데이터 유실
 */
export class RefactorSurveyDestinationTable1770400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. 기존 테이블 DROP
    // =============================================
    await queryRunner.query(
      `DROP TABLE IF EXISTS roadmap_survey_destination_table`,
    );

    // =============================================
    // 2. 새 스키마로 재생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE course_survey_destination_table (
        destination_id VARCHAR(36) NOT NULL,
        course_survey_id VARCHAR(36) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        region_name VARCHAR(100) NOT NULL,
        start_day DATE NOT NULL COMMENT '해당 도시 여행 시작일',
        end_date DATE NOT NULL COMMENT '해당 도시 여행 종료일',
        PRIMARY KEY (destination_id),
        INDEX idx_course_survey_dest_survey_id (course_survey_id),
        INDEX idx_course_survey_dest_region_id (region_id),
        CONSTRAINT fk_course_survey_dest_survey FOREIGN KEY (course_survey_id) REFERENCES roadmap_survey_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_course_survey_dest_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. 새 테이블 DROP
    // =============================================
    await queryRunner.query(
      `DROP TABLE IF EXISTS course_survey_destination_table`,
    );

    // =============================================
    // 2. 원래 스키마로 복원
    // =============================================
    await queryRunner.query(`
      CREATE TABLE roadmap_survey_destination_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        survey_id VARCHAR(36) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        start_date DATE NOT NULL COMMENT '해당 도시 여행 시작일',
        end_date DATE NOT NULL COMMENT '해당 도시 여행 종료일',
        CONSTRAINT fk_survey_destination_survey FOREIGN KEY (survey_id) REFERENCES roadmap_survey_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_survey_destination_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_survey_destination UNIQUE (survey_id, region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_survey_destination_survey_id ON roadmap_survey_destination_table(survey_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_survey_destination_region_id ON roadmap_survey_destination_table(region_id)
    `);
  }
}
