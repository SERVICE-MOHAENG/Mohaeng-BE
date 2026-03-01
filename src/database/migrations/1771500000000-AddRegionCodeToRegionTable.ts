import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * region_table에 region_code 컬럼 추가
 * @description
 * - Python LLM 서버 연동용 지역 코드 컬럼 추가
 * - nullable: 기존 데이터 호환성 유지
 * - 이후 각 지역별 regionCode 값은 별도 DML로 세팅 필요
 */
export class AddRegionCodeToRegionTable1771500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE region_table
      ADD COLUMN region_code ENUM(
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
      ) NULL COMMENT 'Python LLM 서버 연동용 지역 코드'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE region_table DROP COLUMN region_code
    `);
  }
}
