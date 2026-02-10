import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCoursePlaceTravelCourseFK1769600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // course_place_table: travel_course_id FK, 인덱스, 컬럼 제거
    // - CoursePlace는 CourseDay를 통해 TravelCourse에 접근하므로
    //   직접 참조하는 travel_course_id는 불필요 (역정규화 제거)
    // =============================================

    // FK constraint 이름 조회 (초기 마이그레이션에서 이름 없이 생성됨)
    const fkConstraints = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'course_place_table'
        AND COLUMN_NAME = 'travel_course_id'
        AND REFERENCED_TABLE_NAME = 'travel_course_table'
    `);

    for (const fk of fkConstraints) {
      await queryRunner.query(`
        ALTER TABLE course_place_table
        DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
      `);
    }

    await queryRunner.query(`
      DROP INDEX idx_travel_course_id ON course_place_table
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      DROP COLUMN travel_course_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // course_place_table: travel_course_id 컬럼, 인덱스, FK 복원
    // =============================================

    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD COLUMN travel_course_id VARCHAR(36) NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX idx_travel_course_id ON course_place_table(travel_course_id)
    `);

    await queryRunner.query(`
      ALTER TABLE course_place_table
      ADD CONSTRAINT fk_course_place_travel_course FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE
    `);
  }
}
