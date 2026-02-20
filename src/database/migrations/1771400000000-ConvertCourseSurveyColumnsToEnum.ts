import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CourseSurvey 관련 varchar 컬럼들을 ENUM으로 변환
 * @description
 * - course_survey_table: budget, is_dense, is_planned, is_tourist_spots, is_activate, is_efficiency → ENUM
 * - course_survey_companion_table: companion_type → ENUM
 * - course_survey_theme_table: theme_type → ENUM
 */
export class ConvertCourseSurveyColumnsToEnum1771400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. course_survey_table 컬럼 varchar → ENUM 변환
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN budget ENUM(
        'LOW', 'MEDIUM', 'HIGH', 'COST_EFFECTIVE', 'BALANCED', 'PREMIUM_LUXURY'
      ) NOT NULL COMMENT '예산 범위'
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN budget ENUM('COST_EFFECTIVE', 'BALANCED', 'PREMIUM_LUXURY') NOT NULL COMMENT '예산 범위'
    `);

    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_dense ENUM('DENSE', 'RELAXED') NOT NULL COMMENT '일정 밀도 선호'
    `);

    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_planned ENUM('PLANNED', 'SPONTANEOUS') NOT NULL COMMENT '계획 성향'
    `);

    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_tourist_spots ENUM('TOURIST_SPOTS', 'LOCAL_EXPERIENCE') NOT NULL COMMENT '여행지 선호'
    `);

    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_activate ENUM('ACTIVE', 'REST_FOCUSED') NOT NULL COMMENT '활동 선호'
    `);

    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_efficiency ENUM('EFFICIENCY', 'EMOTIONAL') NOT NULL COMMENT '우선 가치'
    `);

    // =============================================
    // 2. course_survey_companion_table: companion_type varchar → ENUM
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_survey_companion_table
      MODIFY COLUMN companion_type ENUM(
        'FAMILY', 'FRIENDS', 'COUPLE', 'CHILDREN', 'PARENTS', 'COLLEAGUES', 'SOLO'
      ) NOT NULL COMMENT '동행자 유형'
    `);

    // =============================================
    // 3. course_survey_theme_table: theme_type varchar → ENUM
    // =============================================
    await queryRunner.query(`
      ALTER TABLE course_survey_theme_table
      MODIFY COLUMN theme_type ENUM(
        'UNIQUE_TRIP', 'HONEYMOON', 'FAMILY_TRIP', 'HEALING', 'SIGHTSEEING',
        'FOOD_TOUR', 'NATURE', 'SHOPPING', 'CULTURE_ART', 'ACTIVITY',
        'CITY_TRIP', 'PHOTO_SPOTS'
      ) NOT NULL COMMENT '여행 테마'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // course_survey_theme_table 복원
    await queryRunner.query(`
      ALTER TABLE course_survey_theme_table
      MODIFY COLUMN theme_type VARCHAR(50) NOT NULL
    `);

    // course_survey_companion_table 복원
    await queryRunner.query(`
      ALTER TABLE course_survey_companion_table
      MODIFY COLUMN companion_type VARCHAR(50) NOT NULL
    `);

    // course_survey_table 복원
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_efficiency VARCHAR(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_activate VARCHAR(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_tourist_spots VARCHAR(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_planned VARCHAR(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN is_dense VARCHAR(50) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE course_survey_table
      MODIFY COLUMN budget VARCHAR(50) NOT NULL
    `);
  }
}
