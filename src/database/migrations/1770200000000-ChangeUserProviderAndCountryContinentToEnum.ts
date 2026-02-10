import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * User.provider, Country.continent VARCHAR 컬럼을 ENUM으로 변환
 * @description
 * - user_table.provider: VARCHAR(50) → ENUM('LOCAL', 'KAKAO', 'NAVER', 'GOOGLE')
 * - country_table.continent: VARCHAR(50) → ENUM('ASIA', 'EUROPE', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'AFRICA', 'OCEANIA', 'MIDDLE_EAST')
 *
 * 비가역 마이그레이션: down() 실행 시 ENUM → VARCHAR로 복원되나,
 * ENUM에 없는 값이 있었다면 데이터 손실 가능
 */
export class ChangeUserProviderAndCountryContinentToEnum1770200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. user_table - provider
    // =============================================
    await queryRunner.query(`
      ALTER TABLE user_table
      MODIFY COLUMN provider ENUM('LOCAL', 'KAKAO', 'NAVER', 'GOOGLE')
        NOT NULL DEFAULT 'LOCAL'
    `);

    // =============================================
    // 2. country_table - continent
    // =============================================
    await queryRunner.query(`
      ALTER TABLE country_table
      MODIFY COLUMN continent ENUM('ASIA', 'EUROPE', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'AFRICA', 'OCEANIA', 'MIDDLE_EAST')
        NOT NULL COMMENT '소속 대륙'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE country_table
      MODIFY COLUMN continent VARCHAR(50) NOT NULL COMMENT '소속 대륙'
    `);

    await queryRunner.query(`
      ALTER TABLE user_table
      MODIFY COLUMN provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL'
    `);
  }
}
