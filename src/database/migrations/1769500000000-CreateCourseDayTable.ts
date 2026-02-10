import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseDayTable1769500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. course_day_table 생성
    // =============================================
    await queryRunner.query(`
      CREATE TABLE course_day_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        course_id VARCHAR(36) NOT NULL,
        day_number INT NOT NULL COMMENT '몇 일차',
        date DATE NOT NULL COMMENT '해당 일차 날짜',
        CONSTRAINT fk_course_day_course FOREIGN KEY (course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
        CONSTRAINT uq_course_day UNIQUE (course_id, day_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_course_day_course_id ON course_day_table(course_id)
    `);

    // =============================================
    // 2. course_place_table: day_number 삭제, course_day_id FK 추가
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD COLUMN course_day_id VARCHAR(36) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD CONSTRAINT fk_course_place_course_day FOREIGN KEY (course_day_id) REFERENCES course_day_table(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX idx_course_place_course_day_id ON course_place_table(course_day_id)
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      DROP COLUMN day_number
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // course_place_table: course_day_id 삭제, day_number 복원
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD COLUMN day_number INT NOT NULL DEFAULT 1 COMMENT '여행 일차'
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      DROP FOREIGN KEY fk_course_place_course_day
    `);

    await queryRunner.query(`
      DROP INDEX idx_course_place_course_day_id ON course_place_table
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      DROP COLUMN course_day_id
    `);

    // =============================================
    // course_day_table 삭제
    // =============================================
    await queryRunner.query(`DROP TABLE IF EXISTS course_day_table`);
  }
}
