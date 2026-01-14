import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRefreshTokenTable1768388534504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS refresh_token_table`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 롤백 시 테이블 재생성
        await queryRunner.query(`
            CREATE TABLE refresh_token_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                token_hash VARCHAR(500) NOT NULL,
                status VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                rotated_at DATETIME NULL,
                revoked_at DATETIME NULL,
                user_id VARCHAR(36) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

}
