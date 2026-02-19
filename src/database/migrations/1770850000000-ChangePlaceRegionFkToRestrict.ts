import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Place-Region FK를 CASCADE에서 RESTRICT로 변경
 * @description
 * - Place.region FK: ON DELETE CASCADE → ON DELETE RESTRICT
 * - Region 삭제 시 연결된 Place가 있으면 삭제 차단
 * - CASCADE 체인 방지: Region → Place → CoursePlace → CourseDay → TravelCourse
 * - 데이터 무결성 및 의도하지 않은 대량 삭제 방지
 */
export class ChangePlaceRegionFkToRestrict1770850000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const fkName = await this.findRegionFkName(queryRunner);
    if (!fkName) {
      return;
    }

    // 1. 기존 FK 제거
    await queryRunner.query(`
      ALTER TABLE place_table
        DROP FOREIGN KEY \`${fkName}\`
    `);

    // 2. RESTRICT로 FK 재생성
    await queryRunner.query(`
      ALTER TABLE place_table
        ADD CONSTRAINT fk_place_region
        FOREIGN KEY (region_id) REFERENCES region_table(id)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql') {
      return;
    }

    const fkName = await this.findRegionFkName(queryRunner);
    if (!fkName) {
      return;
    }

    // 1. FK 제거
    await queryRunner.query(`
      ALTER TABLE place_table
        DROP FOREIGN KEY \`${fkName}\`
    `);

    // 2. CASCADE로 FK 복원
    await queryRunner.query(`
      ALTER TABLE place_table
        ADD CONSTRAINT fk_place_region
        FOREIGN KEY (region_id) REFERENCES region_table(id)
        ON DELETE CASCADE
    `);
  }

  private async findRegionFkName(
    queryRunner: QueryRunner,
  ): Promise<string | null> {
    const fkRows = await queryRunner.query(
      `
      SELECT k.CONSTRAINT_NAME AS constraintName
      FROM information_schema.KEY_COLUMN_USAGE k
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.TABLE_NAME = 'place_table'
        AND k.COLUMN_NAME = 'region_id'
        AND k.REFERENCED_TABLE_NAME = 'region_table'
        AND k.REFERENCED_COLUMN_NAME = 'id'
      LIMIT 1
      `,
    );

    return fkRows.length > 0 ? fkRows[0].constraintName : null;
  }
}
