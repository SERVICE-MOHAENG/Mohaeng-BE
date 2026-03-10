import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionLikeTable1772800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE region_like_table (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        region_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        CONSTRAINT fk_region_like_region
          FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_region_like_user
          FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
        UNIQUE KEY uq_region_like_region_user (region_id, user_id),
        KEY idx_region_like_region (region_id),
        KEY idx_region_like_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS region_like_table`);
  }
}
