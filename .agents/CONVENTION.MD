# CONVENTION.MD

Mohaeng-BE 코딩 컨벤션 및 스타일 가이드입니다.

## 파일 네이밍

| 종류 | 패턴 | 예시 |
|------|------|------|
| 엔티티 | `*.entity.ts` | `User.entity.ts` |
| 컨트롤러 | `*Controller.ts` | `UserController.ts` |
| 서비스 | `*Service.ts` | `UserService.ts` |
| 애플리케이션 서비스 | `*ApplicationService.ts` | `UserApplicationService.ts` |
| 리포지토리 | `*Repository.ts` | `UserRepository.ts` |
| 예외 | `*Exception.ts` | `UserNotFoundException.ts` |
| 인터페이스 | `*.interface.ts` | `User.interface.ts` |
| 열거형 | `*.enum.ts` | `UserStatus.enum.ts` |
| DTO | `*Request.ts` / `*Response.ts` | `CreateUserRequest.ts` |

## 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 | PascalCase | `UserController.ts` |
| 클래스 | PascalCase | `UserController` |
| 메서드 | camelCase | `getUser` |
| 변수 | camelCase | `userId` |
| 상수 | UPPER_SNAKE_CASE | `ADMIN_PERMISSIONS_KEY` |
| 인터페이스 | PascalCase | `UserInterface` |
| 타입 | PascalCase + Type | `UserType` |
| 열거형 | PascalCase + Enum | `UserStatusEnum` |
| 데코레이터 | camelCase | `@currentUser` |
| 폴더 | lowercase | `user` |
| 도메인 | 단수형 | `user` (not `users`) |

## TypeScript 규칙

```typescript
// strict 모드 권장 (현재 noImplicitAny: false)
// nullable 명확히 표시
async findById(id: string): Promise<User | null> {}

// Promise 타입 명시
async create(request: CreateUserRequest): Promise<UserResponse> {}

// any 타입 금지 (eslint off 상태지만 지양)
// 제네릭 적극 활용
function process<T>(data: T): T {}

// optional chaining
const name = user?.profile?.name;

// nullish coalescing
const value = user ?? defaultUser;
```

## 엔티티 정의

```typescript
@Entity('user_table')
export class User {
  @PrimaryColumn({ name: 'user_id' })
  id: string;

  @Column({ name: 'user_name', nullable: false })
  name: string;

  @Column({ name: 'email', nullable: false, default: '' })
  email: string;

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

## 예외 처리

```typescript
// 에러 코드 정의
export enum UserErrorCode {
  USER_NOT_FOUND = 'HE_010101',
  INVALID_EMAIL = 'HE_010102'
}

// 예외 클래스
export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(UserErrorCode.USER_NOT_FOUND, '사용자를 찾을 수 없습니다'),
      HttpStatus.NOT_FOUND
    );
  }
}
```

## 컨트롤러 패턴

```typescript
@ApiTags('users')
@Controller('v1/users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 조회' })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiResponse({ status: 200, type: UserResponse })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { user };  // 객체 래핑 필수
  }

  @Post()
  @ApiOperation({ summary: '사용자 생성' })
  async createUser(@Body() request: CreateUserRequest) {
    const user = await this.userService.create(request);
    return { user };
  }
}
```

## DTO 패턴

```typescript
// Request DTO
export class CreateUserRequest {
  @ApiProperty({ description: '사용자명', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  email: string;
}

// Response DTO
export class UserResponse {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '사용자명' })
  name: string;
}
```

## 인증 데코레이터

```typescript
// 관리자 인증 - 특정 권한 필요
@AdminApiBearerAuth(AdminPermission.PRODUCT_MANAGEMENT)
async createProduct(@CurrentAdmin() admin: AdminUser) {}

// 관리자 인증 - 여러 권한 중 하나
@AdminApiBearerAuth([AdminPermission.ORDER_MANAGEMENT, AdminPermission.PAYMENT_MANAGEMENT])
async getStats(@AdminId() adminId: string) {}

// 사용자 JWT 인증
@UserApiBearerAuth()
async getMyOrders(@UserId() userId: string) {}

// 모든 관리자 접근 가능
@AdminApiBearerAuth()
async getSystemInfo(@CurrentAdmin() admin: AdminUser) {}
```

## 데코레이터 순서

```typescript
// 클래스 레벨
@ApiTags('users')
@Controller('v1/users')
@UseInterceptors(ResponseInterceptor)
export class UserController {}

// 메서드 레벨
@Get(':id')
@ApiOperation({ summary: '조회' })
@ApiParam({ name: 'id' })
@ApiResponse({ status: 200 })
@AdminApiBearerAuth()
async getUser() {}
```

## Import 규칙

```typescript
// 1. NestJS 코어 패키지
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// 2. 써드파티 패키지
import { IsString, IsEmail } from 'class-validator';

// 3. 내부 모듈 (절대 경로 선호)
import { UserService } from '../service/UserService';
import { CreateUserRequest } from './dto/request/CreateUserRequest';

// Barrel export(index.ts) 사용 금지!
// exception/code/index.ts만 예외
```

## 주석 문서화

```typescript
/**
 * 사용자 생성
 * @description
 * - 신규 사용자 등록 처리
 * - 이메일 중복 검증
 * - 환영 메일 발송
 * @param request - 사용자 생성 요청
 * @returns Promise<UserResponse> 생성된 사용자 정보
 * @throws {EmailAlreadyExistsException} 이메일 중복 시
 */
async createUser(request: CreateUserRequest): Promise<UserResponse>
```

## 금지 사항

1. **Barrel Export 금지** - `exception/code/index.ts`만 예외
2. **any 타입 금지** - 명시적 타입 사용
3. **try-catch 남용 금지** - 서비스 계층에서만 예외 처리
4. **컨트롤러 비즈니스 로직 금지** - HTTP 처리만
5. **순환 참조 금지** - 모듈 의존성 단방향 유지
