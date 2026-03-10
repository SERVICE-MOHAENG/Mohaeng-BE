import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionLikeTablePostgres1772800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "region_like_table" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "region_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_region_like_table" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_region_like_region_user" UNIQUE ("region_id", "user_id"),
        CONSTRAINT "FK_region_like_region"
          FOREIGN KEY ("region_id") REFERENCES "region_table"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_region_like_user"
          FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_region_like_region"
      ON "region_like_table" ("region_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_region_like_user"
      ON "region_like_table" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "region_like_table"
    `);
  }
}
