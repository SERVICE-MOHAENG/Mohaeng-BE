import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferenceAndRecommendationTables1768500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. country_table 컬럼 추가
    // =============================================
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD COLUMN continent VARCHAR(50) NOT NULL COMMENT '소속 대륙' AFTER country_image_url,
      ADD COLUMN popularity_score FLOAT NOT NULL DEFAULT 0 COMMENT '0부터 5까지' AFTER continent
    `);

    // =============================================
    // 2. region_table 컬럼 추가
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_table
      ADD COLUMN travel_range VARCHAR(50) NOT NULL COMMENT '한국에서 이동 거리 (설문 2번과 매칭)' AFTER region_image_url,
      ADD COLUMN average_budget_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' COMMENT '평균 여행 예산 수준' AFTER travel_range,
      ADD COLUMN popularity_score DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '인기도 점수 0부터 5' AFTER average_budget_level,
      ADD COLUMN recommendation_score DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'AI 추천 점수 (0-100)' AFTER popularity_score
    `);

    // =============================================
    // 3. Region 매핑 테이블들 생성
    // =============================================

    // 3-1. region_environment_table (설문 3번: 선호 환경)
    await queryRunner.query(`
      CREATE TABLE region_environment_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        environment VARCHAR(50) NOT NULL COMMENT '환경 유형',
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_environment (region_id, environment),
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 3-2. region_food_personality_table (설문 5번: 식도락 성향)
    await queryRunner.query(`
      CREATE TABLE region_food_personality_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        food_personality VARCHAR(50) NOT NULL COMMENT '식도락 성향',
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_food_personality (region_id, food_personality),
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 3-3. region_main_interest_table (설문 6번: 핵심 관심사)
    await queryRunner.query(`
      CREATE TABLE region_main_interest_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        main_interest VARCHAR(50) NOT NULL COMMENT '핵심 관심사',
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_main_interest (region_id, main_interest),
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 3-4. region_category_table (카테고리 태그)
    await queryRunner.query(`
      CREATE TABLE region_category_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        category VARCHAR(50) NOT NULL COMMENT '카테고리',
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_category (region_id, category),
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 3-5. region_travel_style_table (여행 스타일 태그)
    await queryRunner.query(`
      CREATE TABLE region_travel_style_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        travel_style VARCHAR(50) NOT NULL COMMENT '여행 스타일',
        style_score INT NOT NULL DEFAULT 50 COMMENT '해당 스타일의 적합도 점수 (0-100)',
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_travel_style (region_id, travel_style),
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 4. UserPreference 메인 테이블 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE user_preference (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 5. UserPreference 매핑 테이블들 생성
    // =============================================

    // 5-1. user_preference_weather (설문 1번: 날씨/계절)
    await queryRunner.query(`
      CREATE TABLE user_preference_weather (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        weather ENUM('WARM_SUMMER', 'ROMANTIC_WINTER', 'PLEASANT_SPRING_FALL', 'ANY') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-2. user_preference_travel_range (설문 2번: 이동 거리)
    await queryRunner.query(`
      CREATE TABLE user_preference_travel_range (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        travel_range ENUM('DOMESTIC', 'SHORT_HAUL', 'LONG_HAUL') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-3. user_preference_environment (설문 3번: 선호 환경)
    await queryRunner.query(`
      CREATE TABLE user_preference_environment (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        environment ENUM('URBAN_CITY', 'VAST_NATURE', 'HISTORICAL_CULTURE', 'QUIET_HEALING') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-4. user_preference_food_personality (설문 5번: 식도락 성향)
    await queryRunner.query(`
      CREATE TABLE user_preference_food_personality (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        food_personality ENUM('LOCAL_ADVENTURE', 'SAFE_CHOICE', 'CAFE_DESSERT', 'SEAFOOD_SPECIALTY', 'MEAT_SPECIALTY', 'FARM_PRODUCE', 'DAIRY_SPECIALTY', 'STREET_FOOD_SPECIALTY') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-5. user_preference_main_interest (설문 6번: 핵심 관심사)
    await queryRunner.query(`
      CREATE TABLE user_preference_main_interest (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        main_interest ENUM('PHOTO_SPOTS', 'SHOPPING', 'ACTIVITY', 'ART_CULTURE', 'URBAN_EXPLORATION', 'CULTURE_ARTS', 'SHOPPING_STYLE', 'FOOD_SCENE', 'NIGHTLIFE', 'ARCHITECTURE') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-6. user_preference_continent (선호 대륙)
    await queryRunner.query(`
      CREATE TABLE user_preference_continent (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        continent ENUM('ASIA', 'EUROPE', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'AFRICA', 'OCEANIA', 'MIDDLE_EAST') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 5-7. user_preference_budget (예산 수준)
    await queryRunner.query(`
      CREATE TABLE user_preference_budget (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        budget_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // UserPreference 매핑 테이블들 삭제 (역순)
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference_budget`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference_continent`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS user_preference_main_interest`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS user_preference_food_personality`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference_environment`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS user_preference_travel_range`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference_weather`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference`);

    // Region 매핑 테이블들 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS region_travel_style_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS region_category_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS region_main_interest_table`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS region_food_personality_table`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS region_environment_table`);

    // region_table 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE region_table
      DROP COLUMN recommendation_score,
      DROP COLUMN popularity_score,
      DROP COLUMN average_budget_level,
      DROP COLUMN travel_range
    `);

    // country_table 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP COLUMN popularity_score,
      DROP COLUMN continent
    `);
  }
}
