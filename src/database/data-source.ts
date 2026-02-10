import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// .env 파일 로드
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/domain/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations', // 마이그레이션 히스토리 테이블명
  synchronize: false, // 마이그레이션 사용 시 반드시 false
  logging: process.env.NODE_ENV === 'development',
  timezone: '+09:00',
  charset: 'utf8mb4',
});
