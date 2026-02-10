import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeopleCountToTravelCourse1770700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
        ADD COLUMN people_count INT NOT NULL DEFAULT 1 COMMENT '총 여행 인원 수' AFTER days
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
        DROP COLUMN people_count
    `);
  }
}
