import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TravelCourse 타임스탬프 컬럼 수정
 * @description
 * - created_at, updated_at: DATETIME(6) → TIMESTAMP
 * - created_at: DEFAULT CURRENT_TIMESTAMP(6) 추가
 * - updated_at: DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) 추가
 * - TypeORM의 @CreateDateColumn, @UpdateDateColumn과 일치
 */
export class UpdateTravelCourseTimestampColumns1770480000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
        MODIFY COLUMN created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        MODIFY COLUMN updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE travel_course
        MODIFY COLUMN created_at DATETIME(6) NOT NULL,
        MODIFY COLUMN updated_at DATETIME(6) NOT NULL
    `);
  }
}
