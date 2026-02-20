import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignPostgresCourseAndPreferenceSchema1771305000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await this.renameTravelCourseTableIfNeeded(queryRunner);
    await this.renameTravelCourseIdColumnIfNeeded(queryRunner);
    await this.createPreferenceTablesIfNeeded(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query(
      'DROP TABLE IF EXISTS "preference_recommendation_table"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "preference_job_table"');
    await queryRunner.query('DROP TYPE IF EXISTS "preference_job_status_enum"');
  }

  private async renameTravelCourseTableIfNeeded(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const hasTravelCourse = await this.hasTable(queryRunner, 'travel_course');
    const hasTravelCourseTable = await this.hasTable(
      queryRunner,
      'travel_course_table',
    );

    if (!hasTravelCourse && hasTravelCourseTable) {
      await queryRunner.query(
        'ALTER TABLE "travel_course_table" RENAME TO "travel_course"',
      );
    }
  }

  private async renameTravelCourseIdColumnIfNeeded(
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'travel_course'))) {
      return;
    }

    const hasId = await this.hasColumn(queryRunner, 'travel_course', 'id');
    const hasCourseId = await this.hasColumn(
      queryRunner,
      'travel_course',
      'course_id',
    );

    if (!hasId && hasCourseId) {
      await queryRunner.query(
        'ALTER TABLE "travel_course" RENAME COLUMN "course_id" TO "id"',
      );
    }
  }

  private async createPreferenceTablesIfNeeded(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'preference_job_status_enum'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "preference_job_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "preference_job_table" (
        "id" uuid PRIMARY KEY,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "preference_id" uuid NOT NULL,
        "status" "preference_job_status_enum" NOT NULL DEFAULT 'PENDING',
        "error_code" varchar(50) NULL,
        "error_message" text NULL,
        "retry_count" integer NOT NULL DEFAULT 0,
        "started_at" timestamp NULL,
        "completed_at" timestamp NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "preference_recommendation_table" (
        "id" uuid PRIMARY KEY,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "job_id" uuid NOT NULL,
        "region_id" uuid NULL,
        "region_name" varchar(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_preference_job_user_id"
      ON "preference_job_table" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_preference_job_preference_id"
      ON "preference_job_table" ("preference_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_preference_job_status"
      ON "preference_job_table" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_preference_recommendation_job_id"
      ON "preference_recommendation_table" ("job_id")
    `);

    await this.addForeignKeyIfMissing(
      queryRunner,
      'preference_job_table',
      'fk_preference_job_user',
      'FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE',
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'preference_job_table',
      'fk_preference_job_preference',
      'FOREIGN KEY ("preference_id") REFERENCES "user_preference"("id") ON DELETE CASCADE',
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'preference_recommendation_table',
      'fk_preference_recommendation_job',
      'FOREIGN KEY ("job_id") REFERENCES "preference_job_table"("id") ON DELETE CASCADE',
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'preference_recommendation_table',
      'fk_preference_recommendation_region',
      'FOREIGN KEY ("region_id") REFERENCES "region_table"("id") ON DELETE SET NULL',
    );
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
    foreignKeySql: string,
  ): Promise<void> {
    const exists = await queryRunner.query(
      `
      SELECT 1
      FROM pg_constraint
      WHERE conname = $1
      LIMIT 1
      `,
      [constraintName],
    );

    if (exists.length > 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "${tableName}"
      ADD CONSTRAINT "${constraintName}" ${foreignKeySql}
    `);
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
}
