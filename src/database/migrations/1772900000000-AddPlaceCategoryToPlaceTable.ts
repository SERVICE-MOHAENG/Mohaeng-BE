import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaceCategoryToPlaceTable1772900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE place_table
      ADD COLUMN place_category VARCHAR(32) NOT NULL DEFAULT 'OTHER'
      AFTER place_url
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE place_table
      DROP COLUMN place_category
    `);
  }
}
