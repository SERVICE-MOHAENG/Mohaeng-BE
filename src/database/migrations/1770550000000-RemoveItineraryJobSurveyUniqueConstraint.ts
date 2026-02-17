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
  private readonly tableName = 'itinerary_job_table';
  private readonly uniqueIndexName = 'uq_itinerary_job_survey';
  private readonly fallbackIndexName = 'idx_itinerary_job_survey';
  private readonly columnName = 'survey_id';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const uniqueIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.uniqueIndexName],
    );

    if (uniqueIndex.length === 0) {
      return;
    }

    const fallbackIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.fallbackIndexName],
    );

    if (fallbackIndex.length === 0) {
      await queryRunner.query(
        `CREATE INDEX \`${this.fallbackIndexName}\` ON \`${this.tableName}\`(\`${this.columnName}\`)`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE \`${this.tableName}\` DROP INDEX \`${this.uniqueIndexName}\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const uniqueIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.uniqueIndexName],
    );

    if (uniqueIndex.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`${this.tableName}\` ADD UNIQUE KEY \`${this.uniqueIndexName}\` (\`${this.columnName}\`)`,
      );
    }

    const fallbackIndex = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1
      `,
      [this.tableName, this.fallbackIndexName],
    );

    if (fallbackIndex.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`${this.tableName}\` DROP INDEX \`${this.fallbackIndexName}\``,
      );
    }
  }
}
