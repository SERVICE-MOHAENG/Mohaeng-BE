import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Place 테이블 구조 변경
 * @description
 * - PK: UUID(id) → VARCHAR(place_id) 구글 Place ID로 변경
 * - 삭제 컬럼: created_at, place_image_url, opening_hours, category
 * - 추가 컬럼: place_url
 * - 컬럼명 변경: place_description → description
 * - nullable 변경: address, latitude, longitude, region_id → NOT NULL
 * - updated_at: DATETIME(6) → TIMESTAMP (30일마다 API 갱신 추적)
 * - region FK: ON DELETE SET NULL → ON DELETE CASCADE
 *
 * 비가역 마이그레이션: PK 타입 변경으로 기존 데이터 유실
 */
export class RefactorPlaceTable1770300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. course_place_table의 place_table FK 제거
    // =============================================
    const fks = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'course_place_table'
        AND COLUMN_NAME = 'place_id'
        AND REFERENCED_TABLE_NAME = 'place_table'
    `);

    for (const fk of fks) {
      await queryRunner.query(
        `ALTER TABLE course_place_table DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
      );
    }

    // =============================================
    // 2. place_table DROP 후 새 스키마로 재생성
    // =============================================
    await queryRunner.query(`DROP TABLE place_table`);

    await queryRunner.query(`
      CREATE TABLE place_table (
        place_id VARCHAR(255) NOT NULL COMMENT '구글 디비에서 식별하는 장소 아이디',
        region_id VARCHAR(36) NOT NULL,
        place_name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        address VARCHAR(500) NOT NULL,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        updated_at TIMESTAMP NOT NULL COMMENT '30일 마다 다시 조회해야함',
        place_url VARCHAR(500) NOT NULL COMMENT '사용자가 클릭해서 들어가는 url',
        PRIMARY KEY (place_id),
        INDEX idx_place_region_id (region_id),
        CONSTRAINT fk_place_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 3. course_place_table FK 재생성
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_place_table
      MODIFY COLUMN place_id VARCHAR(255) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD CONSTRAINT fk_course_place_place
      FOREIGN KEY (place_id) REFERENCES place_table(place_id)
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. course_place_table FK 제거
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_place_table
      DROP FOREIGN KEY fk_course_place_place
    `);

    // =============================================
    // 2. place_table 원래 스키마로 복원
    // =============================================
    await queryRunner.query(`DROP TABLE place_table`);

    await queryRunner.query(`
      CREATE TABLE place_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL,
        place_name VARCHAR(200) NOT NULL,
        place_description TEXT NULL,
        place_image_url VARCHAR(500) NULL,
        latitude DECIMAL(10, 7) NULL,
        longitude DECIMAL(10, 7) NULL,
        address VARCHAR(500) NULL,
        opening_hours VARCHAR(255) NULL COMMENT '영업시간',
        category VARCHAR(50) NULL COMMENT '장소 카테고리 (음식점, 관광지, 숙박 등)',
        region_id VARCHAR(36) NULL,
        FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE SET NULL,
        INDEX idx_region_id (region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // =============================================
    // 3. course_place_table FK 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_place_table
      MODIFY COLUMN place_id VARCHAR(36) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD CONSTRAINT fk_course_place_place
      FOREIGN KEY (place_id) REFERENCES place_table(id)
      ON DELETE CASCADE
    `);
  }
}
