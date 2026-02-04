import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationCompositeIndex1769700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 복합 인덱스 추가 (user_id, is_read)
    await queryRunner.query(`
      CREATE INDEX idx_notification_user_is_read ON notification_table(user_id, is_read)
    `);

    // 기존 단일 인덱스 제거 (복합 인덱스가 user_id 단독 조회도 커버)
    await queryRunner.query(`
      DROP INDEX idx_is_read ON notification_table
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_is_read ON notification_table(is_read)
    `);

    await queryRunner.query(`
      DROP INDEX idx_notification_user_is_read ON notification_table
    `);
  }
}
