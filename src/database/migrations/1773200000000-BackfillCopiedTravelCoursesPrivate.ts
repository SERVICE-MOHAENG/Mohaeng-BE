import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillCopiedTravelCoursesPrivate1773200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE travel_course
      SET is_public = false
      WHERE source_course_id IS NOT NULL
        AND is_public = true
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // 기존 값 이력이 없어서 롤백 불가
  }
}
