import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 북마크 기능 제거 및 AI 자연어 수정 횟수 컬럼 추가
 * @description
 * - course_bookmark_table 드롭
 * - travel_course.bookmark_count 컬럼 제거
 * - travel_course.modification_count 컬럼 추가 (AI 자연어 수정 요청 횟수, 최대 5회)
 */
export class RemoveBookmarkAndAddModificationCount1772200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. course_bookmark_table 드롭
    await queryRunner.query(`DROP TABLE IF EXISTS course_bookmark_table`);

    // 2. travel_course.bookmark_count 제거
    await queryRunner.query(`
      ALTER TABLE travel_course
      DROP COLUMN bookmark_count
    `);

    // 3. travel_course.modification_count 추가
    await queryRunner.query(`
      ALTER TABLE travel_course
      ADD COLUMN modification_count int NOT NULL DEFAULT 0
        COMMENT 'AI 자연어 수정 요청 횟수 (최대 5회)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // modification_count 제거
    await queryRunner.query(`
      ALTER TABLE travel_course
      DROP COLUMN modification_count
    `);

    // bookmark_count 복구
    await queryRunner.query(`
      ALTER TABLE travel_course
      ADD COLUMN bookmark_count int NOT NULL DEFAULT 0
        COMMENT '북마크 수'
    `);

    // course_bookmark_table 복구
    await queryRunner.query(`
      CREATE TABLE course_bookmark_table (
        id varchar(36) NOT NULL PRIMARY KEY,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        travel_course_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        UNIQUE KEY uq_course_bookmark (travel_course_id, user_id),
        KEY idx_course_bookmark_course (travel_course_id),
        KEY idx_course_bookmark_user (user_id)
      )
    `);
  }
}
