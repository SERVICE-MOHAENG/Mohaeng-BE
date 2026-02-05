import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanionEnum1769800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 SPOUSE 데이터를 COUPLE로 변환
    await queryRunner.query(`
      UPDATE roadmap_survey_companion_table
      SET companion = 'COUPLE'
      WHERE companion = 'SPOUSE'
    `);

    // TEACHER, STUDENTS 데이터 삭제
    await queryRunner.query(`
      DELETE FROM roadmap_survey_companion_table
      WHERE companion IN ('TEACHER', 'STUDENTS')
    `);

    // ENUM 타입 변경 (SPOUSE, TEACHER, STUDENTS 제거)
    await queryRunner.query(`
      ALTER TABLE roadmap_survey_companion_table
      MODIFY COLUMN companion ENUM('FAMILY', 'FRIENDS', 'COUPLE', 'CHILDREN', 'PARENTS', 'COLLEAGUES', 'SOLO') NOT NULL COMMENT '동행자 유형'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // [비가역적 마이그레이션]
    // - SPOUSE → COUPLE로 병합된 데이터는 원래 값을 구분할 수 없어 복원 불가
    // - 삭제된 TEACHER, STUDENTS 데이터는 복구 불가
    // ENUM 정의만 복원
    await queryRunner.query(`
      ALTER TABLE roadmap_survey_companion_table
      MODIFY COLUMN companion ENUM('FAMILY', 'FRIENDS', 'COUPLE', 'SPOUSE', 'CHILDREN', 'PARENTS', 'TEACHER', 'STUDENTS', 'COLLEAGUES', 'SOLO') NOT NULL COMMENT '동행자 유형'
    `);
  }
}
