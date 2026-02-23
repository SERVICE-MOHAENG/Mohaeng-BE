import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * region_table에 region_code 컬럼 추가 (PostgreSQL)
 * @description
 * - Python LLM 서버 연동용 지역 코드 enum 컬럼 추가
 * - nullable: 기존 데이터 호환성 유지
 */
export class AddRegionCodeToRegionTable1771700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const typeName = 'region_table_region_code_enum';

    const typeExists = await queryRunner.query(
      `SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typname = $1 LIMIT 1`,
      [typeName],
    );

    if (typeExists.length === 0) {
      await queryRunner.query(`
        CREATE TYPE "public"."${typeName}" AS ENUM(
          'SEOUL','BUSAN','JEJU_CITY','GYEONGJU',
          'TOKYO','OSAKA','KYOTO','HOKKAIDO','OKINAWA_PREFECTURE',
          'BEIJING','SHANGHAI','TAIPEI','HONG_KONG',
          'SINGAPORE','KUALA_LUMPUR','BANGKOK','PHUKET_PROVINCE','CHIANG_MAI',
          'HANOI','HO_CHI_MINH_CITY','DA_NANG',
          'MANILA','CEBU_CITY','BALI','JAKARTA',
          'NEW_DELHI','MUMBAI','MALDIVES','COLOMBO','KATHMANDU',
          'NEW_YORK_CITY','LOS_ANGELES','SAN_FRANCISCO','LAS_VEGAS','CHICAGO','MIAMI','HAWAII',
          'VANCOUVER','TORONTO','MONTREAL',
          'CANCUN','MEXICO_CITY','HAVANA',
          'RIO_DE_JANEIRO','SAO_PAULO','BUENOS_AIRES','SANTIAGO','CUSCO','LIMA','CARTAGENA',
          'PARIS','NICE','LONDON','EDINBURGH','BERLIN','MUNICH',
          'ROME','VENICE','MILAN','FLORENCE',
          'BARCELONA','MADRID','SEVILLE','LISBON','PORTO',
          'AMSTERDAM','BRUSSELS','ZURICH','INTERLAKEN','VIENNA','SALZBURG',
          'PRAGUE','WARSAW','KRAKOW','BUDAPEST',
          'ATHENS','SANTORINI','DUBROVNIK',
          'REYKJAVIK','OSLO','BERGEN','STOCKHOLM','COPENHAGEN','HELSINKI',
          'MOSCOW','SAINT_PETERSBURG',
          'ISTANBUL','CAPPADOCIA',
          'DUBAI','ABU_DHABI','TEL_AVIV','JERUSALEM','PETRA',
          'CAIRO','MARRAKESH','CASABLANCA',
          'CAPE_TOWN','JOHANNESBURG','NAIROBI','ZANZIBAR',
          'SYDNEY','MELBOURNE','GOLD_COAST','CAIRNS',
          'AUCKLAND','QUEENSTOWN','SUVA'
        )
      `);
    }

    const columnExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'region_table' AND column_name = 'region_code' LIMIT 1`,
    );

    if (columnExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "region_table"
        ADD COLUMN "region_code" "public"."${typeName}" NULL
      `);

      await queryRunner.query(`
        COMMENT ON COLUMN "region_table"."region_code" IS 'Python LLM 서버 연동용 지역 코드'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    const columnExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'region_table' AND column_name = 'region_code' LIMIT 1`,
    );

    if (columnExists.length > 0) {
      await queryRunner.query(`ALTER TABLE "region_table" DROP COLUMN "region_code"`);
    }

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."region_table_region_code_enum"`);
  }
}
