import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorSurveyEnumsAndEntities1769000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. user_preference_weather: ENUM 값 변경
    //    WARM_SUMMER → OCEAN_BEACH
    //    ROMANTIC_WINTER → SNOW_HOT_SPRING
    //    PLEASANT_SPRING_FALL → CLEAN_CITY_BREEZE
    //    ANY → INDOOR_LANDMARK
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_weather
      MODIFY COLUMN weather ENUM('WARM_SUMMER','ROMANTIC_WINTER','PLEASANT_SPRING_FALL','ANY','OCEAN_BEACH','SNOW_HOT_SPRING','CLEAN_CITY_BREEZE','INDOOR_LANDMARK') NOT NULL
    `);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'OCEAN_BEACH' WHERE weather = 'WARM_SUMMER'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'SNOW_HOT_SPRING' WHERE weather = 'ROMANTIC_WINTER'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'CLEAN_CITY_BREEZE' WHERE weather = 'PLEASANT_SPRING_FALL'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'INDOOR_LANDMARK' WHERE weather = 'ANY'`);
    await queryRunner.query(`
      ALTER TABLE user_preference_weather
      MODIFY COLUMN weather ENUM('OCEAN_BEACH','SNOW_HOT_SPRING','CLEAN_CITY_BREEZE','INDOOR_LANDMARK') NOT NULL
    `);

    // =============================================
    // 2. user_preference_travel_range: ENUM 값 변경
    //    DOMESTIC 삭제, MEDIUM_HAUL 추가
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_range
      MODIFY COLUMN travel_range ENUM('DOMESTIC','SHORT_HAUL','LONG_HAUL','MEDIUM_HAUL') NOT NULL
    `);
    await queryRunner.query(`DELETE FROM user_preference_travel_range WHERE travel_range = 'DOMESTIC'`);
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_range
      MODIFY COLUMN travel_range ENUM('SHORT_HAUL','MEDIUM_HAUL','LONG_HAUL') NOT NULL
    `);

    // =============================================
    // 3. user_preference_environment → user_preference_travel_style
    //    테이블 이름 변경 + environment 컬럼을 travel_style 컬럼으로 변경
    //    ENUM 값: URBAN_CITY, VAST_NATURE, HISTORICAL_CULTURE, QUIET_HEALING
    //         → MODERN_TRENDY, HISTORIC_RELAXED, PURE_NATURE
    // =============================================
    await queryRunner.query(`RENAME TABLE user_preference_environment TO user_preference_travel_style`);
    // 새 ENUM 값을 먼저 추가
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_style
      CHANGE COLUMN environment travel_style ENUM('URBAN_CITY','VAST_NATURE','HISTORICAL_CULTURE','QUIET_HEALING','MODERN_TRENDY','HISTORIC_RELAXED','PURE_NATURE') NOT NULL
    `);
    // 기존 데이터 삭제 (1:1 매핑 불가하므로)
    await queryRunner.query(`DELETE FROM user_preference_travel_style WHERE travel_style NOT IN ('MODERN_TRENDY','HISTORIC_RELAXED','PURE_NATURE')`);
    // ENUM을 새 값만 남김
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_style
      MODIFY COLUMN travel_style ENUM('MODERN_TRENDY','HISTORIC_RELAXED','PURE_NATURE') NOT NULL
    `);

    // =============================================
    // 4. user_preference_food_personality: ENUM 값 변경
    //    기존 8개 → 새로운 3개
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_food_personality
      MODIFY COLUMN food_personality ENUM('LOCAL_ADVENTURE','SAFE_CHOICE','CAFE_DESSERT','SEAFOOD_SPECIALTY','MEAT_SPECIALTY','FARM_PRODUCE','DAIRY_SPECIALTY','STREET_FOOD_SPECIALTY','LOCAL_HIDDEN_GEM','FINE_DINING','INSTAGRAMMABLE') NOT NULL
    `);
    await queryRunner.query(`DELETE FROM user_preference_food_personality WHERE food_personality NOT IN ('LOCAL_HIDDEN_GEM','FINE_DINING','INSTAGRAMMABLE')`);
    await queryRunner.query(`
      ALTER TABLE user_preference_food_personality
      MODIFY COLUMN food_personality ENUM('LOCAL_HIDDEN_GEM','FINE_DINING','INSTAGRAMMABLE') NOT NULL
    `);

    // =============================================
    // 5. user_preference_main_interest: ENUM 값 변경
    //    기존 10개 → 새로운 3개
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_main_interest
      MODIFY COLUMN main_interest ENUM('PHOTO_SPOTS','SHOPPING','ACTIVITY','ART_CULTURE','URBAN_EXPLORATION','CULTURE_ARTS','SHOPPING_STYLE','FOOD_SCENE','NIGHTLIFE','ARCHITECTURE','SHOPPING_TOUR','DYNAMIC_ACTIVITY','ART_AND_CULTURE') NOT NULL
    `);
    await queryRunner.query(`DELETE FROM user_preference_main_interest WHERE main_interest NOT IN ('SHOPPING_TOUR','DYNAMIC_ACTIVITY','ART_AND_CULTURE')`);
    await queryRunner.query(`
      ALTER TABLE user_preference_main_interest
      MODIFY COLUMN main_interest ENUM('SHOPPING_TOUR','DYNAMIC_ACTIVITY','ART_AND_CULTURE') NOT NULL
    `);

    // =============================================
    // 6. user_preference_continent 테이블 삭제
    // =============================================
    await queryRunner.query(`DROP TABLE IF EXISTS user_preference_continent`);

    // =============================================
    // 7. user_preference_budget: ENUM 값 변경
    //    LOW → COST_EFFECTIVE, MEDIUM → BALANCED, HIGH → PREMIUM_LUXURY
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_budget
      MODIFY COLUMN budget_level ENUM('LOW','MEDIUM','HIGH','COST_EFFECTIVE','BALANCED','PREMIUM_LUXURY') NOT NULL
    `);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'COST_EFFECTIVE' WHERE budget_level = 'LOW'`);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'BALANCED' WHERE budget_level = 'MEDIUM'`);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'PREMIUM_LUXURY' WHERE budget_level = 'HIGH'`);
    await queryRunner.query(`
      ALTER TABLE user_preference_budget
      MODIFY COLUMN budget_level ENUM('COST_EFFECTIVE','BALANCED','PREMIUM_LUXURY') NOT NULL
    `);

    // =============================================
    // 8. region_table: average_budget_level 기본값 변경
    //    MEDIUM → BALANCED (VARCHAR 컬럼이라 ENUM 변경 불필요)
    // =============================================
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'COST_EFFECTIVE' WHERE average_budget_level = 'LOW'`);
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'BALANCED' WHERE average_budget_level = 'MEDIUM'`);
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'PREMIUM_LUXURY' WHERE average_budget_level = 'HIGH'`);
    await queryRunner.query(`ALTER TABLE region_table ALTER COLUMN average_budget_level SET DEFAULT 'BALANCED'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 8. region_table: average_budget_level 기본값 복원
    // =============================================
    await queryRunner.query(`ALTER TABLE region_table ALTER COLUMN average_budget_level SET DEFAULT 'MEDIUM'`);
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'LOW' WHERE average_budget_level = 'COST_EFFECTIVE'`);
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'MEDIUM' WHERE average_budget_level = 'BALANCED'`);
    await queryRunner.query(`UPDATE region_table SET average_budget_level = 'HIGH' WHERE average_budget_level = 'PREMIUM_LUXURY'`);

    // =============================================
    // 7. user_preference_budget: ENUM 값 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_budget
      MODIFY COLUMN budget_level ENUM('LOW','MEDIUM','HIGH','COST_EFFECTIVE','BALANCED','PREMIUM_LUXURY') NOT NULL
    `);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'LOW' WHERE budget_level = 'COST_EFFECTIVE'`);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'MEDIUM' WHERE budget_level = 'BALANCED'`);
    await queryRunner.query(`UPDATE user_preference_budget SET budget_level = 'HIGH' WHERE budget_level = 'PREMIUM_LUXURY'`);
    await queryRunner.query(`
      ALTER TABLE user_preference_budget
      MODIFY COLUMN budget_level ENUM('LOW','MEDIUM','HIGH') NOT NULL
    `);

    // =============================================
    // 6. user_preference_continent 테이블 복원
    // =============================================
    await queryRunner.query(`
      CREATE TABLE user_preference_continent (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        user_preference_id VARCHAR(36) NOT NULL,
        continent ENUM('ASIA','EUROPE','NORTH_AMERICA','SOUTH_AMERICA','AFRICA','OCEANIA','MIDDLE_EAST') NOT NULL,
        FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
        INDEX idx_user_preference_id (user_preference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 5. user_preference_main_interest: ENUM 값 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_main_interest
      MODIFY COLUMN main_interest ENUM('PHOTO_SPOTS','SHOPPING','ACTIVITY','ART_CULTURE','URBAN_EXPLORATION','CULTURE_ARTS','SHOPPING_STYLE','FOOD_SCENE','NIGHTLIFE','ARCHITECTURE') NOT NULL
    `);

    // =============================================
    // 4. user_preference_food_personality: ENUM 값 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_food_personality
      MODIFY COLUMN food_personality ENUM('LOCAL_ADVENTURE','SAFE_CHOICE','CAFE_DESSERT','SEAFOOD_SPECIALTY','MEAT_SPECIALTY','FARM_PRODUCE','DAIRY_SPECIALTY','STREET_FOOD_SPECIALTY') NOT NULL
    `);

    // =============================================
    // 3. user_preference_travel_style → user_preference_environment 복원
    //    travel_style 컬럼을 environment 컬럼으로 되돌림
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_style
      CHANGE COLUMN travel_style environment ENUM('URBAN_CITY','VAST_NATURE','HISTORICAL_CULTURE','QUIET_HEALING') NOT NULL
    `);
    await queryRunner.query(`RENAME TABLE user_preference_travel_style TO user_preference_environment`);

    // =============================================
    // 2. user_preference_travel_range: ENUM 값 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_travel_range
      MODIFY COLUMN travel_range ENUM('DOMESTIC','SHORT_HAUL','LONG_HAUL') NOT NULL
    `);

    // =============================================
    // 1. user_preference_weather: ENUM 값 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_preference_weather
      MODIFY COLUMN weather ENUM('WARM_SUMMER','ROMANTIC_WINTER','PLEASANT_SPRING_FALL','ANY','OCEAN_BEACH','SNOW_HOT_SPRING','CLEAN_CITY_BREEZE','INDOOR_LANDMARK') NOT NULL
    `);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'WARM_SUMMER' WHERE weather = 'OCEAN_BEACH'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'ROMANTIC_WINTER' WHERE weather = 'SNOW_HOT_SPRING'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'PLEASANT_SPRING_FALL' WHERE weather = 'CLEAN_CITY_BREEZE'`);
    await queryRunner.query(`UPDATE user_preference_weather SET weather = 'ANY' WHERE weather = 'INDOOR_LANDMARK'`);
    await queryRunner.query(`
      ALTER TABLE user_preference_weather
      MODIFY COLUMN weather ENUM('WARM_SUMMER','ROMANTIC_WINTER','PLEASANT_SPRING_FALL','ANY') NOT NULL
    `);
  }
}