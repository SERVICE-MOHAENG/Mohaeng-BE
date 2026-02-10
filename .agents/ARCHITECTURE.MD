# ARCHITECTURE.MD

Mohaeng-BE 시스템 아키텍처 및 DDD 구조 문서입니다.

## 아키텍처 개요

NestJS 기반의 DDD(Domain-Driven Design) 아키텍처를 채택하고 있습니다.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Controllers, DTOs, Swagger Decorators)                    │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│  (ApplicationService - 도메인 조율, 트랜잭션 관리)           │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Service - 비즈니스 로직, Entities, Value Objects)         │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│  (Repository, External Services, Database)                  │
└─────────────────────────────────────────────────────────────┘
```

## 도메인 폴더 구조

새로운 도메인 추가 시 반드시 다음 폴더 구조를 따릅니다:

```
src/domain/{domain-name}/
├── entity/              # 도메인 엔티티
│   └── {Domain}.entity.ts
├── persistence/         # 리포지토리, 데이터 접근 계층
│   └── {Domain}Repository.ts
├── presentation/        # 컨트롤러, DTO
│   ├── {Domain}Controller.ts
│   └── dto/
│       ├── request/
│       │   └── Create{Domain}Request.ts
│       └── response/
│           └── {Domain}Response.ts
├── service/             # 비즈니스 로직
│   ├── {Domain}Service.ts
│   └── {Domain}ApplicationService.ts
└── exception/           # 도메인 예외
    ├── {Domain}Exception.ts
    └── code/
        └── {Domain}ErrorCode.ts
```

## 계층별 책임

### Presentation Layer

컨트롤러는 HTTP 요청/응답 처리만 담당합니다.

```typescript
@ApiTags('users')
@Controller('v1/users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 조회' })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { user };  // 객체 래핑 필수
  }
}
```

### Application Layer

복잡한 비즈니스 플로우를 조율합니다.

```typescript
export class UserApplicationService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService
  ) {}

  async createUserWithWelcomeEmail(request: CreateUserRequest) {
    const user = await this.userService.create(request);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}
```

### Domain Layer

핵심 비즈니스 로직을 처리합니다.

```typescript
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const user = User.create(request.name, request.email);
    await this.userRepository.save(user);
    return { id: user.id, name: user.name };
  }
}
```

### Infrastructure Layer

데이터 접근 및 외부 서비스 통합을 담당합니다.

```typescript
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
```

## Global 계층 구조

```
src/global/
├── GlobalModule.ts          # 전역 모듈
├── BaseEntity.ts            # 기본 엔티티 (미구현)
├── decorators/              # 커스텀 데코레이터
│   ├── AdminApiBearerAuth.ts
│   ├── UserApiBearerAuth.ts
│   ├── CurrentAdmin.ts
│   ├── CurrentUser.ts
│   ├── AdminId.ts
│   └── UserId.ts
├── dto/
│   └── ApiResponseDto.ts    # 통합 응답 DTO
├── exception/               # 전역 예외
│   ├── code/
│   │   └── index.ts         # 에러 코드 (유일한 barrel export)
│   ├── GlobalUnauthorizedException.ts
│   ├── GlobalForbiddenException.ts
│   └── ... (10개 예외 클래스)
├── filters/
│   └── GlobalExceptionFilter.ts
├── interceptors/
│   └── ResponseInterceptor.ts
└── logger/
    ├── Logger.module.ts
    ├── DiscordService.ts
    └── LogInterceptorService.ts
```

## 요청 흐름

```
HTTP Request
    │
    ▼
┌──────────────────────┐
│  GlobalExceptionFilter│  ← 예외 처리
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  ResponseInterceptor │  ← 응답 래핑
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  ValidationPipe      │  ← DTO 검증
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Auth Guards         │  ← 인증/인가 (구현 예정)
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Controller          │  ← HTTP 처리
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  ApplicationService  │  ← 도메인 조율
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Service             │  ← 비즈니스 로직
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Repository          │  ← 데이터 접근
└──────────────────────┘
```

## 모듈 구성

각 도메인은 독립적인 모듈로 구성됩니다.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserApplicationService,
    UserRepository
  ],
  exports: [UserService]
})
export class UserModule {}
```

## 의존성 방향

```
Presentation → Application → Domain → Infrastructure
     ↓              ↓           ↓           ↓
  Controller   AppService    Service    Repository
```

**주의**: 순환 참조를 방지하기 위해 하위 계층은 상위 계층을 참조하지 않습니다.
