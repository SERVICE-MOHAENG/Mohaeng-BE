import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * country_table, region_table에서 점수 관련 컬럼 제거
 * @description
 * - country_table: popularity_score 컬럼 및 CHECK 제약 제거
 * - region_table: popularity_score, ai_score 컬럼 및 CHECK 제약 제거
 */
export class RemoveScoreColumnsFromCountryAndRegion1771600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // country_table CHECK 제약 제거 후 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP CHECK chk_country_popularity_score
    `);
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP COLUMN popularity_score
    `);

    // region_table CHECK 제약 제거 후 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE region_table
      DROP CHECK chk_region_popularity_score
    `);
    await queryRunner.query(`
      ALTER TABLE region_table
      DROP COLUMN popularity_score,
      DROP COLUMN ai_score
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // country_table 롤백
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD COLUMN popularity_score FLOAT NOT NULL DEFAULT 0 COMMENT '인기도 점수 0-5'
    `);
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD CONSTRAINT chk_country_popularity_score
      CHECK (popularity_score >= 0 AND popularity_score <= 5)
    `);

    // region_table 롤백
    await queryRunner.query(`
      ALTER TABLE region_table
      ADD COLUMN popularity_score DECIMAL NOT NULL DEFAULT 0 COMMENT '인기도 점수 0-5',
      ADD COLUMN ai_score DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'AI 추천 점수 (0-100)'
    `);
    await queryRunner.query(`
      ALTER TABLE region_table
      ADD CONSTRAINT chk_region_popularity_score
      CHECK (popularity_score >= 0 AND popularity_score <= 5)
    `);
  }
}
