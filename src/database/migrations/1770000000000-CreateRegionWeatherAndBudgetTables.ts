import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionWeatherAndBudgetTables1770000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. region_weather_table (설문 1번: 날씨/계절 매칭)
    // =============================================
    await queryRunner.query(`
      CREATE TABLE region_weather_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        region_id VARCHAR(36) NOT NULL,
        region_weather ENUM('OCEAN_BEACH', 'SNOW_HOT_SPRING', 'CLEAN_CITY_BREEZE', 'INDOOR_LANDMARK') NOT NULL COMMENT '날씨/계절 선호',
        CONSTRAINT fk_region_weather_region FOREIGN KEY (region_id)
          REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_weather (region_id, region_weather),
        INDEX idx_region_weather_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 2. region_budget_table (예산 규모 매칭)
    // =============================================
    await queryRunner.query(`
      CREATE TABLE region_budget_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        region_id VARCHAR(36) NOT NULL,
        region_budget ENUM('COST_EFFECTIVE', 'BALANCED', 'PREMIUM_LUXURY') NOT NULL COMMENT '예산 수준',
        CONSTRAINT fk_region_budget_region FOREIGN KEY (region_id)
          REFERENCES region_table(id) ON DELETE CASCADE,
        UNIQUE KEY unique_region_budget (region_id, region_budget),
        INDEX idx_region_budget_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS region_budget_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS region_weather_table`);
  }
}
