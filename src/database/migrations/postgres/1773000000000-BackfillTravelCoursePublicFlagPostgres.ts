import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillTravelCoursePublicFlagPostgres1773000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "travel_course"
      SET "is_public" = true
      WHERE "is_public" = false
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // 기존 값 이력이 없어서 롤백 불가
  }
}
