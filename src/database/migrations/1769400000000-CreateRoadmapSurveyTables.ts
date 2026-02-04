import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoadmapSurveyTables1769400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. roadmap_survey_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE roadmap_survey_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        user_id VARCHAR(36) NOT NULL,
        travel_course_id VARCHAR(36) NULL UNIQUE,
        pax_count INT NOT NULL COMMENT '인원수',
        budget ENUM('LOW', 'MID', 'HIGH', 'LUXURY') NOT NULL COMMENT '예산 범위',
        user_note TEXT NULL COMMENT '사용자 자연어 요구사항',
        pace_preference ENUM('DENSE', 'RELAXED') NOT NULL COMMENT '일정 밀도 선호',
        planning_preference ENUM('PLANNED', 'SPONTANEOUS') NOT NULL COMMENT '계획 성향',
        destination_preference ENUM('TOURIST_SPOTS', 'LOCAL_EXPERIENCE') NOT NULL COMMENT '여행지 선호',
        activity_preference ENUM('ACTIVE', 'REST_FOCUSED') NOT NULL COMMENT '활동 선호',
        priority_preference ENUM('EFFICIENCY', 'EMOTIONAL') NOT NULL COMMENT '우선 가치 선호',
        CONSTRAINT fk_roadmap_survey_user FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_roadmap_survey_travel_course FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_roadmap_survey_user_id ON roadmap_survey_table(user_id)
    `);

    // =============================================
    // 2. roadmap_survey_destination_table 생성 (Region과 N:M)
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

    // =============================================
    // 3. roadmap_survey_companion_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE roadmap_survey_companion_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        survey_id VARCHAR(36) NOT NULL,
        companion ENUM('FAMILY', 'FRIENDS', 'COUPLE', 'SPOUSE', 'CHILDREN', 'PARENTS', 'TEACHER', 'STUDENTS', 'COLLEAGUES', 'SOLO') NOT NULL COMMENT '동행자 유형',
        CONSTRAINT fk_survey_companion_survey FOREIGN KEY (survey_id) REFERENCES roadmap_survey_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_survey_companion UNIQUE (survey_id, companion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_survey_companion_survey_id ON roadmap_survey_companion_table(survey_id)
    `);

    // =============================================
    // 4. roadmap_survey_theme_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE roadmap_survey_theme_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        survey_id VARCHAR(36) NOT NULL,
        theme ENUM('UNIQUE_TRIP', 'HONEYMOON', 'FAMILY_TRIP', 'HEALING', 'SIGHTSEEING', 'FOOD_TOUR', 'NATURE', 'SHOPPING', 'CULTURE_ART', 'ACTIVITY', 'CITY_TRIP', 'PHOTO_SPOTS') NOT NULL COMMENT '여행 테마',
        CONSTRAINT fk_survey_theme_survey FOREIGN KEY (survey_id) REFERENCES roadmap_survey_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_survey_theme UNIQUE (survey_id, theme)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_survey_theme_survey_id ON roadmap_survey_theme_table(survey_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS roadmap_survey_theme_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS roadmap_survey_companion_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS roadmap_survey_destination_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS roadmap_survey_table`);
  }
}
