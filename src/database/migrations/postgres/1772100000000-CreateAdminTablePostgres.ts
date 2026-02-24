import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * admin_table 생성 (PostgreSQL)
 */
export class CreateAdminTablePostgres1772100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const tableExists = await queryRunner.query(
      `SELECT 1
         FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'admin_table'
        LIMIT 1`,
    );

    if (tableExists.length > 0) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "admin_table" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "username" VARCHAR(100) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "permissions" INTEGER NOT NULL DEFAULT 0,
        "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_admin_table" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_username" UNIQUE ("username")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query(`DROP TABLE IF EXISTS "admin_table"`);
  }
}
