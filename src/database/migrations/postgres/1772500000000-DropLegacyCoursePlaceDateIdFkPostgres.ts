import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * DropLegacyCoursePlaceDateIdFkPostgres
 * @description
 * - 근본 원인: 1771000000000-InitPostgresSchema의 synchronize()가 당시 엔티티 기반으로
 *   `course_place.date_id` → `course_day_table.id` FK를 자동 생성
 *   (TypeORM FK hash: sha1("course_place_date_id").substr(0,27) = "a2f3d65b296029c3bee511cf20b")
 * - 이후 1771315000000에서 course_place.day_id → course_day_id 로 rename 완료로 인해
 *   1771500000000의 date_id → course_day_id rename이 NO-OP 처리됨
 * - 결과: date_id 컬럼 + FK_a2f3d65b296029c3bee511cf20b 가 프로덕션 DB에 레거시로 잔존
 * - 이 마이그레이션은 해당 레거시 FK 및 컬럼을 안전하게 제거
 */
export class DropLegacyCoursePlaceDateIdFkPostgres1772500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    // 1. 레거시 FK 제거
    await this.dropConstraintIfExists(
      queryRunner,
      'course_place',
      'FK_a2f3d65b296029c3bee511cf20b',
    );

    // 2. 레거시 date_id 컬럼 제거 (rename이 no-op으로 처리된 경우 잔존)
    await this.dropColumnIfExists(queryRunner, 'course_place', 'date_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }
    // date_id 컬럼과 레거시 FK는 복원하지 않음 (이 마이그레이션의 목적은 정리)
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

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (!(await this.hasTable(queryRunner, tableName))) {
      return;
    }
    if (!(await this.hasColumn(queryRunner, tableName, columnName))) {
      return;
    }
    await queryRunner.query(
      `ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`,
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
