import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItineraryJobAndUpdateCoursePlace1770500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. itinerary_job_table 생성
    await queryRunner.query(`
      CREATE TABLE itinerary_job_table (
        id VARCHAR(36) PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '작업 상태',
        user_id VARCHAR(36) NOT NULL,
        survey_id VARCHAR(36) NULL,
        travel_course_id VARCHAR(36) NULL,
        attempt_count INT NOT NULL DEFAULT 0 COMMENT '시도 횟수',
        error_code VARCHAR(50) NULL COMMENT '에러 코드',
        error_message TEXT NULL COMMENT '에러 메시지',
        llm_commentary TEXT NULL COMMENT 'LLM이 생성한 코멘터리 (코스 선정 이유)',
        next_action_suggestions JSON NULL COMMENT 'LLM이 제안하는 다음 행동 목록',
        started_at TIMESTAMP NULL COMMENT '처리 시작 시각',
        completed_at TIMESTAMP NULL COMMENT '완료 시각',
        UNIQUE KEY uq_itinerary_job_survey (survey_id),
        INDEX idx_itinerary_job_user (user_id),
        INDEX idx_itinerary_job_status (status),
        CONSTRAINT fk_itinerary_job_user FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const surveyTable = await this.resolveSurveyTable(queryRunner);
    if (surveyTable) {
      await queryRunner.query(`
        ALTER TABLE itinerary_job_table
          ADD CONSTRAINT fk_itinerary_job_survey
          FOREIGN KEY (survey_id) REFERENCES ${surveyTable.tableName}(${surveyTable.columnName})
          ON DELETE CASCADE
      `);
    }

    const travelCourseColumn = await this.resolveTravelCoursePkColumn(queryRunner);
    if (travelCourseColumn) {
      await queryRunner.query(`
        ALTER TABLE itinerary_job_table
          ADD CONSTRAINT fk_itinerary_job_course
          FOREIGN KEY (travel_course_id) REFERENCES travel_course(${travelCourseColumn})
          ON DELETE SET NULL
      `);
    }

    // 2. course_place(+legacy course_place_table)에 visit_time, description 컬럼 추가
    const coursePlaceTable = await this.resolveCoursePlaceTable(queryRunner);
    if (!coursePlaceTable) {
      return;
    }

    const hasVisitTime = await this.hasColumn(
      queryRunner,
      coursePlaceTable,
      'visit_time',
    );
    if (!hasVisitTime) {
      await queryRunner.query(`
        ALTER TABLE ${coursePlaceTable}
          ADD COLUMN visit_time VARCHAR(5) NULL COMMENT '방문 시각 (HH:MM)' AFTER memo
      `);
    }

    const hasDescription = await this.hasColumn(
      queryRunner,
      coursePlaceTable,
      'description',
    );
    if (!hasDescription) {
      await queryRunner.query(`
        ALTER TABLE ${coursePlaceTable}
          ADD COLUMN description TEXT NULL COMMENT '장소 한줄 설명' AFTER visit_time
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 2. course_place(+legacy course_place_table)에서 추가 컬럼 제거
    const coursePlaceTable = await this.resolveCoursePlaceTable(queryRunner);
    if (coursePlaceTable) {
      const hasDescription = await this.hasColumn(
        queryRunner,
        coursePlaceTable,
        'description',
      );
      if (hasDescription) {
        await queryRunner.query(`
          ALTER TABLE ${coursePlaceTable}
            DROP COLUMN description
        `);
      }

      const hasVisitTime = await this.hasColumn(
        queryRunner,
        coursePlaceTable,
        'visit_time',
      );
      if (hasVisitTime) {
        await queryRunner.query(`
          ALTER TABLE ${coursePlaceTable}
            DROP COLUMN visit_time
        `);
      }
    }

    // 1. itinerary_job_table 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS itinerary_job_table`);
  }

  private async hasTable(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
      LIMIT 1
      `,
      [tableName],
    );

    return rows.length > 0;
  }

  private async hasColumn(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
      `,
      [tableName, columnName],
    );

    return rows.length > 0;
  }

  private async resolveSurveyTable(
    queryRunner: QueryRunner,
  ): Promise<{ tableName: string; columnName: string } | null> {
    if (
      (await this.hasTable(queryRunner, 'course_survey_table')) &&
      (await this.hasColumn(queryRunner, 'course_survey_table', 'course_survay_id'))
    ) {
      return { tableName: 'course_survey_table', columnName: 'course_survay_id' };
    }

    if (
      (await this.hasTable(queryRunner, 'roadmap_survey_table')) &&
      (await this.hasColumn(queryRunner, 'roadmap_survey_table', 'id'))
    ) {
      return { tableName: 'roadmap_survey_table', columnName: 'id' };
    }

    return null;
  }

  private async resolveTravelCoursePkColumn(
    queryRunner: QueryRunner,
  ): Promise<'course_id' | 'id' | null> {
    if (!(await this.hasTable(queryRunner, 'travel_course'))) {
      return null;
    }

    if (await this.hasColumn(queryRunner, 'travel_course', 'course_id')) {
      return 'course_id';
    }

    if (await this.hasColumn(queryRunner, 'travel_course', 'id')) {
      return 'id';
    }

    return null;
  }

  private async resolveCoursePlaceTable(
    queryRunner: QueryRunner,
  ): Promise<'course_place' | 'course_place_table' | null> {
    if (await this.hasTable(queryRunner, 'course_place')) {
      return 'course_place';
    }

    if (await this.hasTable(queryRunner, 'course_place_table')) {
      return 'course_place_table';
    }

    return null;
  }
}
