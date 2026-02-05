import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseRegionTable1769200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // course_region_table: 여행 코스-지역 다대다 매핑 테이블 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE course_region_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        course_id VARCHAR(36) NOT NULL,
        region_id VARCHAR(36) NOT NULL,
        CONSTRAINT fk_course_region_course FOREIGN KEY (course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
        CONSTRAINT fk_course_region_region FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_course_region UNIQUE (course_id, region_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_course_region_course_id ON course_region_table(course_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_course_region_region_id ON course_region_table(region_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // course_region_table: 테이블 삭제
    // =============================================
    await queryRunner.query(`DROP TABLE IF EXISTS course_region_table`);
  }
}
