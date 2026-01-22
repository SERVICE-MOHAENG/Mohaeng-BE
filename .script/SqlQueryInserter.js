const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function generateUUID() {
  return crypto.randomUUID();
}

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [],
  synchronize: false,
  logging: true,
  timezone: '+09:00',
  charset: 'utf8mb4',
});

async function insertDummyData() {
  try {
    console.log('데이터베이스 연결 중...');

    // 먼저 데이터베이스 없이 연결하여 데이터베이스 생성
    const tempDataSource = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });

    await tempDataSource.initialize();
    await tempDataSource.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`데이터베이스 '${process.env.DB_DATABASE}' 확인/생성 완료`);
    await tempDataSource.destroy();

    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공!');

    const dummyDataPath = path.join(__dirname, 'dummyData.json');
    const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf-8'));

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('\n국가 데이터 삽입 시작...');
      const countryIds = {};

      for (const country of dummyData.countries) {
        const uuid = generateUUID();
        const result = await queryRunner.query(
          `INSERT INTO country_table (id, country_name, country_code, country_image_url, continent, popularity_score, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE
           country_name = VALUES(country_name),
           country_image_url = VALUES(country_image_url),
           popularity_score = VALUES(popularity_score),
           updated_at = NOW()`,
          [
            uuid,
            country.name,
            country.code,
            country.imageUrl,
            country.continent,
            country.popularityScore,
          ]
        );

        const rows = await queryRunner.query(
          `SELECT id FROM country_table WHERE country_code = ?`,
          [country.code]
        );
        countryIds[country.code] = rows[0].id;
        console.log(`✓ 국가 삽입 완료: ${country.name} (${country.code})`);
      }

      console.log('\n지역 데이터 삽입 시작...');
      for (const region of dummyData.regions) {
        const countryId = countryIds[region.countryCode];
        if (!countryId) {
          console.log(`✗ 국가를 찾을 수 없음: ${region.countryCode}, 지역 ${region.name} 건너뜀`);
          continue;
        }

        const regionUuid = generateUUID();
        await queryRunner.query(
          `INSERT INTO region_table (
            id,
            region_name,
            latitude,
            longitude,
            region_image_url,
            travel_range,
            average_budget_level,
            popularity_score,
            ai_score,
            region_description,
            country_id,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          region_image_url = VALUES(region_image_url),
          travel_range = VALUES(travel_range),
          average_budget_level = VALUES(average_budget_level),
          popularity_score = VALUES(popularity_score),
          ai_score = VALUES(ai_score),
          region_description = VALUES(region_description),
          updated_at = NOW()`,
          [
            regionUuid,
            region.name,
            region.latitude,
            region.longitude,
            region.imageUrl,
            region.travelRange,
            region.averageBudgetLevel,
            region.popularityScore,
            region.recommendationScore,
            region.regionDescription,
            countryId,
          ]
        );
        console.log(`✓ 지역 삽입 완료: ${region.name} (${region.countryCode})`);
      }

      await queryRunner.commitTransaction();
      console.log('\n✓ 모든 더미 데이터 삽입 완료!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('✗ 트랜잭션 롤백:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('✗ 에러 발생:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n데이터베이스 연결 종료');
    }
  }
}

insertDummyData();
