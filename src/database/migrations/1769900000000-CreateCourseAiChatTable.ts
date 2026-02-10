import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseAiChatTable1769900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE course_ai_chat_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        course_id VARCHAR(36) NOT NULL,
        role ENUM('USER', 'AI', 'SYSTEM') NOT NULL COMMENT '메시지 발신자 (USER: 사용자, AI: AI, SYSTEM: 시스템)',
        content TEXT NOT NULL COMMENT '메시지 내용',
        CONSTRAINT fk_course_ai_chat_course FOREIGN KEY (course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE INDEX idx_course_ai_chat_course_id ON course_ai_chat_table(course_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS course_ai_chat_table`);
  }
}
