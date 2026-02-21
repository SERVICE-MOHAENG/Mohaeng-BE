import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignPostgresSchemaWithEntities1771600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await this.alignPreferenceTables(queryRunner);
    await this.alignCourseSurveyEnums(queryRunner);
    await this.alignItineraryAndForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }
  }

  private async alignPreferenceTables(queryRunner: QueryRunner): Promise<void> {
    await this.ensureEnumType(queryRunner, 'preference_job_table_status_enum', [
      'PENDING',
      'PROCESSING',
      'SUCCESS',
      'FAILED',
    ]);

    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'preference_job_table',
      'status',
      'preference_job_table_status_enum',
    );

    await this.setDefaultIfColumnExists(
      queryRunner,
      'preference_job_table',
      'status',
      `'PENDING'`,
    );
    await this.dropTypeIfExists(queryRunner, 'preference_job_status_enum_old');

    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'status',
      '작업 상태',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'error_code',
      '에러 코드',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'error_message',
      '에러 메시지',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'retry_count',
      'FAILED 콜백 재시도 횟수 (최대 1회)',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'started_at',
      '처리 시작 시각',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_job_table',
      'completed_at',
      '완료 시각',
    );

    await this.setDefaultIfColumnExists(
      queryRunner,
      'preference_recommendation_table',
      'id',
      'uuid_generate_v4()',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_recommendation_table',
      'region_id',
      'Region FK (DB에 없으면 null)',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'preference_recommendation_table',
      'region_name',
      '추천 여행지명 (Python 서버에서 받은 코드값)',
    );
  }

  private async alignCourseSurveyEnums(queryRunner: QueryRunner): Promise<void> {
    await this.ensureEnumType(
      queryRunner,
      'course_survey_companion_companion_type_enum',
      ['FAMILY', 'FRIENDS', 'COUPLE', 'CHILDREN', 'PARENTS', 'COLLEAGUES', 'SOLO'],
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_companion',
      'companion_type',
      'course_survey_companion_companion_type_enum',
    );
    await this.setNotNullIfColumnExists(
      queryRunner,
      'course_survey_companion',
      'companion_type',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_companion',
      'companion_type',
      '동행자 유형',
    );

    await this.ensureEnumType(queryRunner, 'course_survey_theme_theme_type_enum', [
      'UNIQUE_TRIP',
      'HONEYMOON',
      'FAMILY_TRIP',
      'HEALING',
      'SIGHTSEEING',
      'FOOD_TOUR',
      'NATURE',
      'SHOPPING',
      'CULTURE_ART',
      'ACTIVITY',
      'CITY_TRIP',
      'PHOTO_SPOTS',
    ]);
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_theme',
      'theme_type',
      'course_survey_theme_theme_type_enum',
    );
    await this.setNotNullIfColumnExists(
      queryRunner,
      'course_survey_theme',
      'theme_type',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_theme',
      'theme_type',
      '여행 테마',
    );

    await this.ensureEnumType(queryRunner, 'course_survey_table_budget_enum', [
      'LOW',
      'MID',
      'HIGH',
      'LUXURY',
    ]);
    await this.ensureEnumType(queryRunner, 'course_survey_table_is_dense_enum', [
      'DENSE',
      'RELAXED',
    ]);
    await this.ensureEnumType(queryRunner, 'course_survey_table_is_planned_enum', [
      'PLANNED',
      'SPONTANEOUS',
    ]);
    await this.ensureEnumType(
      queryRunner,
      'course_survey_table_is_tourist_spots_enum',
      ['TOURIST_SPOTS', 'LOCAL_EXPERIENCE'],
    );
    await this.ensureEnumType(queryRunner, 'course_survey_table_is_activate_enum', [
      'ACTIVE',
      'REST_FOCUSED',
    ]);
    await this.ensureEnumType(
      queryRunner,
      'course_survey_table_is_efficiency_enum',
      ['EFFICIENCY', 'EMOTIONAL'],
    );

    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'budget',
      'course_survey_table_budget_enum',
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'is_dense',
      'course_survey_table_is_dense_enum',
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'is_planned',
      'course_survey_table_is_planned_enum',
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'is_tourist_spots',
      'course_survey_table_is_tourist_spots_enum',
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'is_activate',
      'course_survey_table_is_activate_enum',
    );
    await this.alterEnumColumnIfNeeded(
      queryRunner,
      'course_survey_table',
      'is_efficiency',
      'course_survey_table_is_efficiency_enum',
    );

    await this.setNotNullIfColumnExists(queryRunner, 'course_survey_table', 'budget');
    await this.setNotNullIfColumnExists(queryRunner, 'course_survey_table', 'is_dense');
    await this.setNotNullIfColumnExists(queryRunner, 'course_survey_table', 'is_planned');
    await this.setNotNullIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_tourist_spots',
    );
    await this.setNotNullIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_activate',
    );
    await this.setNotNullIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_efficiency',
    );

    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'budget',
      '예산 범위',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_dense',
      '일정 밀도 선호: DENSE=빡빡하게, RELAXED=널널하게',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_planned',
      '계획 성향: PLANNED=계획형, SPONTANEOUS=즉흥형',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_tourist_spots',
      '여행지 선호: TOURIST_SPOTS=관광지 위주, LOCAL_EXPERIENCE=로컬 위주',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_activate',
      '활동 선호: ACTIVE=활동 중심, REST_FOCUSED=휴식 중심',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'course_survey_table',
      'is_efficiency',
      '우선 가치: EFFICIENCY=효율 우선, EMOTIONAL=감성 우선',
    );
  }

  private async alignItineraryAndForeignKeys(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await this.commentIfColumnExists(
      queryRunner,
      'itinerary_job_table',
      'job_type',
      '작업 유형: GENERATION, MODIFICATION',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'itinerary_job_table',
      'intent_status',
      'Intent 분류 결과 (MODIFICATION 전용)',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'itinerary_job_table',
      'diff_keys',
      '변경된 노드 ID 목록 (MODIFICATION 전용)',
    );
    await this.commentIfColumnExists(
      queryRunner,
      'itinerary_job_table',
      'user_query',
      '사용자 수정 요청 메시지 (MODIFICATION 전용)',
    );
    await this.dropNotNullIfColumnExists(
      queryRunner,
      'itinerary_job_table',
      'survey_id',
    );

    await this.dropConstraintIfExists(
      queryRunner,
      'itinerary_job_table',
      'UQ_904c1d86d75f038788d730c8460',
    );
    await this.dropConstraintIfExists(
      queryRunner,
      'itinerary_job_table',
      'REL_bd1500db8cd8a66ce238dd6792',
    );

    await this.addConstraintIfMissing(
      queryRunner,
      'place',
      'FK_e95901eff317e7ea8fccfae5165',
      'FOREIGN KEY ("region_id") REFERENCES "region_table"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'course_place',
      'FK_ccde1c2e24e108348bbc8464e7d',
      'FOREIGN KEY ("course_day_id") REFERENCES "course_day_table"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'course_place',
      'FK_afb32e50da5f00e17dba0fe97bf',
      'FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'course_day_table',
      'FK_82fd58b544e175f2088514f2ede',
      'FOREIGN KEY ("course_id") REFERENCES "travel_course"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'preference_job_table',
      'FK_eddd67878818dab291ba442b908',
      'FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'preference_job_table',
      'FK_91c8ea15e2eb63dcceb5242cc6c',
      'FOREIGN KEY ("preference_id") REFERENCES "user_preference"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'preference_recommendation_table',
      'FK_97ce4ee17625d50516e5539030c',
      'FOREIGN KEY ("job_id") REFERENCES "preference_job_table"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'preference_recommendation_table',
      'FK_cf1e3861b419c4bd55143e74e98',
      'FOREIGN KEY ("region_id") REFERENCES "region_table"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );

    await this.dropConstraintIfExists(
      queryRunner,
      'itinerary_job_table',
      'FK_904c1d86d75f038788d730c8460',
    );
    await this.dropConstraintIfExists(
      queryRunner,
      'itinerary_job_table',
      'FK_bd1500db8cd8a66ce238dd6792e',
    );

    await this.addConstraintIfMissing(
      queryRunner,
      'itinerary_job_table',
      'FK_904c1d86d75f038788d730c8460',
      'FOREIGN KEY ("survey_id") REFERENCES "course_survey_table"("course_survay_id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'itinerary_job_table',
      'FK_bd1500db8cd8a66ce238dd6792e',
      'FOREIGN KEY ("travel_course_id") REFERENCES "travel_course"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'roadmap_survey_destination_table',
      'FK_3e2696c3cc9edb651e061f4a8ac',
      'FOREIGN KEY ("survey_id") REFERENCES "roadmap_survey_table"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'roadmap_survey_destination_table',
      'FK_b947a863dc7953dedd2ed696edb',
      'FOREIGN KEY ("region_id") REFERENCES "region_table"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  private async ensureEnumType(
    queryRunner: QueryRunner,
    typeName: string,
    values: string[],
  ): Promise<void> {
    const exists = await this.hasType(queryRunner, typeName);
    if (exists) {
      return;
    }

    const valueSql = values.map((v) => `'${v}'`).join(', ');
    await queryRunner.query(
      `CREATE TYPE "public"."${typeName}" AS ENUM(${valueSql})`,
    );
  }

  private async dropTypeIfExists(
    queryRunner: QueryRunner,
    typeName: string,
  ): Promise<void> {
    if (!(await this.hasType(queryRunner, typeName))) {
      return;
    }
    await queryRunner.query(`DROP TYPE "public"."${typeName}"`);
  }

  private async alterEnumColumnIfNeeded(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    typeName: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    const currentType = await this.getColumnUdtName(
      queryRunner,
      tableName,
      columnName,
    );
    if (currentType === typeName) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE "public"."${typeName}" USING "${columnName}"::text::"public"."${typeName}"`,
    );
  }

  private async setDefaultIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    sqlDefault: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${sqlDefault}`,
    );
  }

  private async setNotNullIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL`,
    );
  }

  private async dropNotNullIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP NOT NULL`,
    );
  }

  private async commentIfColumnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    comment: string,
  ): Promise<void> {
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }

    const escaped = comment.replace(/'/g, "''");
    await queryRunner.query(
      `COMMENT ON COLUMN "${tableName}"."${columnName}" IS '${escaped}'`,
    );
  }

  private async addConstraintIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
    bodySql: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }

    const exists = await this.hasConstraint(queryRunner, constraintName);
    if (exists) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" ${bodySql}`,
    );
  }

  private async dropConstraintIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }
    if (!(await this.hasConstraint(queryRunner, constraintName))) {
      return;
    }
    await queryRunner.query(
      `ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}"`,
    );
  }

  private async hasConstraint(
    queryRunner: QueryRunner,
    constraintName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM pg_constraint
      WHERE conname = $1
      LIMIT 1
      `,
      [constraintName],
    );
    return rows.length > 0;
  }

  private async hasType(
    queryRunner: QueryRunner,
    typeName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = $1
      LIMIT 1
      `,
      [typeName],
    );
    return rows.length > 0;
  }

  private async hasTable(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
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
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
      `,
      [tableName, columnName],
    );
    return rows.length > 0;
  }

  private async getColumnUdtName(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<string | null> {
    const rows = await queryRunner.query(
      `
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
      `,
      [tableName, columnName],
    );
    return rows[0]?.udt_name ?? null;
  }
}
