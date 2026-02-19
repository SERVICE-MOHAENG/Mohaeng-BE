import { MigrationInterface, QueryRunner } from 'typeorm';

type ColumnInfo = {
  data_type: string;
  udt_name: string;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
};

export class EnsureItineraryModificationColumnsPostgres1771205000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (!(await this.hasTable(queryRunner, 'itinerary_job_table'))) {
      return;
    }

    await this.ensureEnumType(
      queryRunner,
      'itinerary_job_table_job_type_enum',
      ['GENERATION', 'MODIFICATION'],
    );
    await this.ensureEnumType(
      queryRunner,
      'itinerary_job_table_intent_status_enum',
      ['SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED'],
    );

    await this.ensureJobTypeColumn(queryRunner);
    await this.ensureIntentStatusColumn(queryRunner);
    await this.addColumnIfMissing(
      queryRunner,
      'diff_keys',
      '"diff_keys" json NULL',
    );
    await this.addColumnIfMissing(
      queryRunner,
      'user_query',
      '"user_query" text NULL',
    );

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_itinerary_job_travel_course_type"
      ON "itinerary_job_table" ("travel_course_id", "job_type", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    if (!(await this.hasTable(queryRunner, 'itinerary_job_table'))) {
      return;
    }

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_itinerary_job_travel_course_type"
    `);

    await this.dropColumnIfExists(queryRunner, 'user_query');
    await this.dropColumnIfExists(queryRunner, 'diff_keys');
    await this.dropColumnIfExists(queryRunner, 'intent_status');
    await this.dropColumnIfExists(queryRunner, 'job_type');

    await queryRunner.query(
      'DROP TYPE IF EXISTS "itinerary_job_table_intent_status_enum"',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS "itinerary_job_table_job_type_enum"',
    );
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

  private async getColumnInfo(
    queryRunner: QueryRunner,
    columnName: string,
  ): Promise<ColumnInfo | null> {
    const rows = (await queryRunner.query(
      `
      SELECT data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'itinerary_job_table'
        AND column_name = $1
      LIMIT 1
      `,
      [columnName],
    )) as ColumnInfo[];

    return rows.length > 0 ? rows[0] : null;
  }

  private async ensureEnumType(
    queryRunner: QueryRunner,
    enumName: string,
    values: string[],
  ): Promise<void> {
    const enumValues = values.map((v) => `'${v}'`).join(', ');

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = '${enumName}'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "${enumName}" AS ENUM (${enumValues});
        END IF;
      END $$;
    `);
  }

  private async ensureJobTypeColumn(queryRunner: QueryRunner): Promise<void> {
    const info = await this.getColumnInfo(queryRunner, 'job_type');
    const enumType = 'itinerary_job_table_job_type_enum';

    if (!info) {
      await queryRunner.query(`
        ALTER TABLE "itinerary_job_table"
        ADD COLUMN "job_type" "${enumType}" NOT NULL DEFAULT 'GENERATION'
      `);
      return;
    }

    if (info.udt_name !== enumType) {
      await queryRunner.query(`
        ALTER TABLE "itinerary_job_table"
        ALTER COLUMN "job_type" TYPE "${enumType}"
        USING (
          CASE
            WHEN "job_type"::text IN ('GENERATION', 'MODIFICATION')
              THEN "job_type"::text::"${enumType}"
            ELSE 'GENERATION'::"${enumType}"
          END
        )
      `);
    }

    await queryRunner.query(`
      UPDATE "itinerary_job_table"
      SET "job_type" = 'GENERATION'
      WHERE "job_type" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "itinerary_job_table"
      ALTER COLUMN "job_type" SET DEFAULT 'GENERATION',
      ALTER COLUMN "job_type" SET NOT NULL
    `);
  }

  private async ensureIntentStatusColumn(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const info = await this.getColumnInfo(queryRunner, 'intent_status');
    const enumType = 'itinerary_job_table_intent_status_enum';

    if (!info) {
      await queryRunner.query(`
        ALTER TABLE "itinerary_job_table"
        ADD COLUMN "intent_status" "${enumType}" NULL
      `);
      return;
    }

    if (info.udt_name !== enumType) {
      await queryRunner.query(`
        ALTER TABLE "itinerary_job_table"
        ALTER COLUMN "intent_status" TYPE "${enumType}"
        USING (
          CASE
            WHEN "intent_status" IS NULL THEN NULL
            WHEN "intent_status"::text IN ('SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED')
              THEN "intent_status"::text::"${enumType}"
            ELSE NULL
          END
        )
      `);
    }
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    columnName: string,
    definitionSql: string,
  ): Promise<void> {
    const info = await this.getColumnInfo(queryRunner, columnName);
    if (info) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "itinerary_job_table"
      ADD COLUMN ${definitionSql}
    `);
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    columnName: string,
  ): Promise<void> {
    const info = await this.getColumnInfo(queryRunner, columnName);
    if (!info) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "itinerary_job_table"
      DROP COLUMN "${columnName}"
    `);
  }
}
