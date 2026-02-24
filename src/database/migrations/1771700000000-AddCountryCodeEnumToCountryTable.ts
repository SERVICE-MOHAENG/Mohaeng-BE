import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * country_table에 country_code_enum 컬럼 추가
 * @description
 * - 국가 식별용 enum 코드 컬럼 추가
 * - 클라이언트에는 한국어 이름(country_name)으로 표시, 내부/Python 서버에는 이 enum 값 사용
 */
export class AddCountryCodeEnumToCountryTable1771700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE country_table
      ADD COLUMN country_code_enum ENUM(
        'ARGENTINA','AUSTRALIA','AUSTRIA','BELGIUM','BRAZIL','CANADA','CHILE',
        'CHINA','COLOMBIA','CROATIA','CUBA','CZECH_REPUBLIC','DENMARK','EGYPT',
        'FINLAND','FRANCE','GERMANY','GREECE','GUAM','HONG_KONG','HUNGARY',
        'ICELAND','INDIA','INDONESIA','ISRAEL','ITALY','JAPAN','MALAYSIA',
        'MEXICO','MONGOLIA','MOROCCO','NEPAL','NETHERLANDS','NEW_ZEALAND',
        'NORWAY','PERU','PHILIPPINES','POLAND','PORTUGAL','RUSSIA','SINGAPORE',
        'SOUTH_KOREA','SPAIN','SWEDEN','SWITZERLAND','TAIWAN','THAILAND',
        'TURKIYE','UNITED_KINGDOM','UNITED_STATES','VIETNAM'
      ) NOT NULL UNIQUE COMMENT '국가 식별 enum 코드'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE country_table
      DROP COLUMN country_code_enum
    `);
  }
}
