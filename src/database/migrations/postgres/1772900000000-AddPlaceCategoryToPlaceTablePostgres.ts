import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaceCategoryToPlaceTablePostgres1772900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "place_table"
      ADD COLUMN IF NOT EXISTS "place_category" varchar(32) NOT NULL DEFAULT 'OTHER'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "place_table"
      DROP COLUMN IF EXISTS "place_category"
    `);
  }
}
