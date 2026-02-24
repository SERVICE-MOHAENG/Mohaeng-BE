import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * admin_table 생성
 * @description
 * - 관리자 계정 테이블 생성
 * - 비트마스크 기반 권한 관리
 */
export class CreateAdminTable1772000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE admin_table (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        permissions INT NOT NULL DEFAULT 0,
        is_super_admin BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT PK_admin_table PRIMARY KEY (id),
        CONSTRAINT UQ_admin_email UNIQUE (email)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE admin_table`);
  }
}
