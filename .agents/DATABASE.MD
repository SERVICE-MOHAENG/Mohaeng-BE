# DATABASE.MD

Mohaeng-BE 데이터베이스 설계 및 엔티티 가이드입니다.

## 현재 상태

**TypeORM 미설정 상태**

현재 프로젝트에는 데이터베이스 통합이 아직 구현되지 않았습니다:
- `@nestjs/typeorm` 패키지 미설치
- 데이터베이스 드라이버 미설치 (mysql, postgres 등)
- `BaseEntity.ts` 파일 비어있음

## 엔티티 설계 가이드

### 기본 엔티티 구조

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_table')
export class User {
  @PrimaryColumn({ name: 'user_id' })
  id: string;

  @Column({ name: 'user_name', nullable: false })
  name: string;

  @Column({ name: 'email', nullable: false, default: '' })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 팩토리 메서드 필수
  static create(name: string, email: string): User {
    const user = new User();
    user.id = crypto.randomUUID();
    user.name = name;
    user.email = email;
    return user;
  }
}
```

### 컬럼 네이밍

| TypeScript | 데이터베이스 |
|------------|-------------|
| `id` | `{entity}_id` |
| `name` | `{entity}_name` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### 테이블 네이밍

```typescript
@Entity('user_table')      // 단수형 + _table 접미사
@Entity('product_table')
@Entity('order_table')
```

## 리포지토리 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
```

## 관계 설정

### OneToMany / ManyToOne

```typescript
@Entity('order_table')
export class Order {
  @PrimaryColumn({ name: 'order_id' })
  id: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('user_table')
export class User {
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}
```

### ManyToMany

```typescript
@Entity('product_table')
export class Product {
  @ManyToMany(() => Category)
  @JoinTable({
    name: 'product_category',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'category_id' }
  })
  categories: Category[];
}
```

## 성능 최적화

### N+1 쿼리 방지

```typescript
// BAD: N+1 문제 발생
const users = await userRepository.find();
for (const user of users) {
  const orders = await orderRepository.find({ where: { userId: user.id } });
}

// GOOD: 조인으로 해결
const users = await userRepository.find({
  relations: ['orders']
});
```

### 페이징 필수

```typescript
async findAll(page: number, limit: number): Promise<[User[], number]> {
  return this.repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' }
  });
}
```

## 에러 로그 엔티티 (예정)

현재 `ErrorLogService.ts`에 스텁으로 정의된 구조:

```typescript
// 현재 스텁 상태
export interface ErrorLog {
  // TODO: 퍼시스턴스 레이어 준비 후 실제 엔티티로 교체
}

// 예상 엔티티 구조
@Entity('error_log_table')
export class ErrorLog {
  @PrimaryColumn({ name: 'error_log_id' })
  id: string;

  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'path' })
  path: string;

  @Column({ name: 'method' })
  method: string;

  @Column({ name: 'status_code' })
  statusCode: number;

  @Column({ name: 'error_message', type: 'text' })
  errorMessage: string;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

## DDL 변경 가이드

DB 엔티티 변경 시 반드시:

1. 변경 사항을 사용자에게 알림
2. 필요한 DDL 문을 제공
3. 마이그레이션 전략 논의

```sql
-- 예시: 사용자 테이블 생성
CREATE TABLE user_table (
  user_id VARCHAR(36) PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_user_email ON user_table(email);
```

## TypeORM 설정 가이드

향후 TypeORM 설정 시:

```typescript
// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',  // 또는 'postgres'
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,  // 프로덕션에서는 false 필수
      logging: process.env.NODE_ENV === 'development'
    })
  ]
})
export class AppModule {}
```
