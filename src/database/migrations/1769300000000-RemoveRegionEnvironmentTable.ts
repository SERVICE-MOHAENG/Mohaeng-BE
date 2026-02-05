import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRegionEnvironmentTable1769300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. region_environment_table 백업 후 삭제
    //    - Environment ENUM은 TravelStyle로 대체됨
    //    - region_travel_style_table이 이미 존재함
    // =============================================
    await queryRunner.query(`
      CREATE TABLE region_environment_table_backup AS
      SELECT * FROM region_environment_table
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS region_environment_table`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // region_environment_table 복원
    // =============================================
    await queryRunner.query(`
      CREATE TABLE region_environment_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        region_id VARCHAR(36) NOT NULL,
        environment VARCHAR(50) NOT NULL COMMENT '환경 유형',
        CONSTRAINT fk_region_environment_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_region_environment UNIQUE (region_id, environment)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      INSERT INTO region_environment_table (id, created_at, updated_at, region_id, environment)
      SELECT id, created_at, updated_at, region_id, environment
      FROM region_environment_table_backup
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS region_environment_table_backup`);
  }
}
