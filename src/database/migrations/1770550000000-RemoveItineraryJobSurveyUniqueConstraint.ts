import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * ItineraryJob survey_id unique constraint 제거
 * @description
 * - survey_id의 UNIQUE 제약조건 제거
 * - 동일 설문에 대한 재시도를 허용 (실패 시 재생성 가능)
 * - OneToOne → ManyToOne 관계 변경에 따른 스키마 정합성 확보
 */
export class RemoveItineraryJobSurveyUniqueConstraint1770550000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        DROP INDEX uq_itinerary_job_survey
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE itinerary_job_table
        ADD UNIQUE KEY uq_itinerary_job_survey (survey_id)
    `);
  }
}
