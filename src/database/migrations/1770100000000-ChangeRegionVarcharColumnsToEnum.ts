import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Region 관련 테이블의 VARCHAR 컬럼을 ENUM으로 변환
 * @description
 * - region_table: travel_range, average_budget_level
 * - region_travel_style_table: travel_style
 * - region_food_personality_table: food_personality
 * - region_main_interest_table: main_interest
 * - region_category_table: category
 *
 * 비가역 마이그레이션: down() 실행 시 ENUM → VARCHAR로 복원되나,
 * ENUM에 없는 값이 있었다면 데이터 손실 가능
 */
export class ChangeRegionVarcharColumnsToEnum1770100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. region_table - travel_range
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_table
      MODIFY COLUMN travel_range ENUM('SHORT_HAUL', 'MEDIUM_HAUL', 'LONG_HAUL')
        NOT NULL COMMENT '한국에서 이동 거리 (설문 2번과 매칭)'
    `);

    // =============================================
    // 2. region_table - average_budget_level
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_table
      MODIFY COLUMN average_budget_level ENUM('COST_EFFECTIVE', 'BALANCED', 'PREMIUM_LUXURY')
        NOT NULL DEFAULT 'BALANCED' COMMENT '평균 여행 예산 수준'
    `);

    // =============================================
    // 3. region_travel_style_table - travel_style
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_travel_style_table
      MODIFY COLUMN travel_style ENUM('MODERN_TRENDY', 'HISTORIC_RELAXED', 'PURE_NATURE')
        NOT NULL COMMENT '여행 스타일'
    `);

    // =============================================
    // 4. region_food_personality_table - food_personality
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_food_personality_table
      MODIFY COLUMN food_personality ENUM('LOCAL_HIDDEN_GEM', 'FINE_DINING', 'INSTAGRAMMABLE')
        NOT NULL COMMENT '식도락 성향'
    `);

    // =============================================
    // 5. region_main_interest_table - main_interest
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_main_interest_table
      MODIFY COLUMN main_interest ENUM('SHOPPING_TOUR', 'DYNAMIC_ACTIVITY', 'ART_AND_CULTURE')
        NOT NULL COMMENT '핵심 관심사'
    `);

    // =============================================
    // 6. region_category_table - category
    // =============================================
    await queryRunner.query(`
      ALTER TABLE region_category_table
      MODIFY COLUMN category ENUM('BEACH', 'MOUNTAIN', 'MUSEUM', 'TEMPLE', 'PALACE', 'PARK', 'RESTAURANT', 'CAFE', 'MARKET', 'SHOPPING_MALL', 'LANDMARK')
        NOT NULL COMMENT '카테고리'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ENUM → VARCHAR(50) 복원
    await queryRunner.query(`
      ALTER TABLE region_category_table
      MODIFY COLUMN category VARCHAR(50) NOT NULL COMMENT '카테고리'
    `);

    await queryRunner.query(`
      ALTER TABLE region_main_interest_table
      MODIFY COLUMN main_interest VARCHAR(50) NOT NULL COMMENT '핵심 관심사'
    `);

    await queryRunner.query(`
      ALTER TABLE region_food_personality_table
      MODIFY COLUMN food_personality VARCHAR(50) NOT NULL COMMENT '식도락 성향'
    `);

    await queryRunner.query(`
      ALTER TABLE region_travel_style_table
      MODIFY COLUMN travel_style VARCHAR(50) NOT NULL COMMENT '여행 스타일'
    `);

    await queryRunner.query(`
      ALTER TABLE region_table
      MODIFY COLUMN average_budget_level VARCHAR(50) NOT NULL DEFAULT 'BALANCED' COMMENT '평균 여행 예산 수준'
    `);

    await queryRunner.query(`
      ALTER TABLE region_table
      MODIFY COLUMN travel_range VARCHAR(50) NOT NULL COMMENT '한국에서 이동 거리 (설문 2번과 매칭)'
    `);
  }
}
