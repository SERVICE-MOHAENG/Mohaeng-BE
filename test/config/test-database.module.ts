import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/domain/user/entity/User.entity';
import { RefreshToken } from '../../src/domain/auth/entity/RefreshToken.entity';

/**
 * TestDatabaseModule
 * @description
 * - E2E 테스트용 In-memory SQLite 데이터베이스 모듈
 * - MySQL 의존성 없이 독립적으로 실행 가능
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User, RefreshToken],
      synchronize: true,
      dropSchema: true,
      logging: false,
      // SQLite에서 외래 키 제약 조건 활성화
      prepareDatabase: (db: any) => {
        db.prepare('PRAGMA foreign_keys = ON;').run();
      },
    }),
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  exports: [TypeOrmModule],
})
export class TestDatabaseModule {}
