import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * country_table에 country_code_enum 컬럼 추가
 * @description
 * - 국가 식별용 enum 코드 컬럼 추가
 * - 클라이언트에는 한국어 이름(country_name)으로 표시, 내부/Python 서버에는 이 enum 값 사용
 */
export class AddCountryCodeEnumToCountryTable1771900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "country_table_country_code_enum_enum" AS ENUM(
        'ARGENTINA','AUSTRALIA','AUSTRIA','BELGIUM','BRAZIL','CANADA','CHILE',
        'CHINA','COLOMBIA','CROATIA','CUBA','CZECH_REPUBLIC','DENMARK','EGYPT',
        'FINLAND','FRANCE','GERMANY','GREECE','GUAM','HONG_KONG','HUNGARY',
        'ICELAND','INDIA','INDONESIA','ISRAEL','ITALY','JAPAN','MALAYSIA',
        'MEXICO','MONGOLIA','MOROCCO','NEPAL','NETHERLANDS','NEW_ZEALAND',
        'NORWAY','PERU','PHILIPPINES','POLAND','PORTUGAL','RUSSIA','SINGAPORE',
        'SOUTH_KOREA','SPAIN','SWEDEN','SWITZERLAND','TAIWAN','THAILAND',
        'TURKIYE','UNITED_KINGDOM','UNITED_STATES','VIETNAM'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD COLUMN country_code_enum "country_table_country_code_enum_enum" NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD CONSTRAINT UQ_country_code_enum UNIQUE (country_code_enum)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP CONSTRAINT UQ_country_code_enum
    `);
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP COLUMN country_code_enum
    `);
    await queryRunner.query(`
      DROP TYPE "country_table_country_code_enum_enum"
    `);
  }
}
