# API_DESIGN.MD

Mohaeng-BE API 설계 원칙 및 엔드포인트 패턴입니다.

## API 기본 설정

- **Base URL**: `/api`
- **버전 관리**: URL 경로에 포함 (`/v1/`, `/v2/`)
- **포트**: 8080 (기본값)
- **문서화**: Swagger UI (`/api-docs`)

## URL 패턴

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

**예시**:
```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/users/:id/orders
```

## HTTP 메서드

| 메서드 | 용도 | 성공 코드 |
|--------|------|----------|
| GET | 조회 | 200 |
| POST | 생성 | 201 |
| PUT | 전체 수정 | 200 |
| PATCH | 부분 수정 | 200 |
| DELETE | 삭제 | 204 |

## 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "홍길동"
    }
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "errorCode": "HE_010101",
  "message": "사용자를 찾을 수 없습니다"
}
```

## 에러 코드 체계

```
TRIP_CORE_HE_{domain}{category}{sequence}
```

**현재 정의된 코드**:
| 코드 | 의미 |
|------|------|
| `HE_000001` | 필수 토큰 누락 |
| `HE_000002` | 잘못된 토큰 |
| `HE_000003` | 인증되지 않은 사용자 |
| `HE_000004` | 접근 권한 없음 |
| `HE_000101` | 존재하지 않는 사용자 |
| `HE_000102` | 잘못된 요청 |
| `HE_000501` | 서버 내부 오류 |
| `HE_000502` | 데이터베이스 오류 |
| `HE_000503` | 외부 서비스 오류 |

## 컨트롤러 구현

```typescript
@ApiTags('users')
@Controller('v1/users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getUsers(@Query() query: GetUsersQuery) {
    const users = await this.userService.findAll(query);
    return { users };
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { user };
  }

  @Post()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiBody({ type: CreateUserRequest })
  @ApiResponse({ status: 201, type: UserResponse })
  async createUser(@Body() request: CreateUserRequest) {
    const user = await this.userService.create(request);
    return { user };
  }

  @Put(':id')
  @ApiOperation({ summary: '사용자 수정' })
  async updateUser(
    @Param('id') id: string,
    @Body() request: UpdateUserRequest
  ) {
    const user = await this.userService.update(id, request);
    return { user };
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
```

## 인증 API

### 관리자 인증

```typescript
@AdminApiBearerAuth(AdminPermission.USER_MANAGEMENT)
@Get('admin/users')
async getAdminUsers(@CurrentAdmin() admin: AdminUser) {
  // admin.permissions 확인 가능
}
```

### 사용자 인증

```typescript
@UserApiBearerAuth()
@Get('my/profile')
async getMyProfile(@UserId() userId: string) {
  // JWT 토큰에서 추출된 userId 사용
}
```

## 페이징

### 요청

```typescript
export class PaginationQuery {
  @ApiProperty({ description: '페이지 번호', default: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: '페이지 크기', default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
```

### 응답

```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Validation

### ValidationPipe 설정

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // DTO에 정의되지 않은 속성 제거
  forbidNonWhitelisted: true, // 정의되지 않은 속성 전달 시 에러
  transform: true,           // 자동 타입 변환
  enableImplicitConversion: true
}));
```

### DTO 예시

```typescript
export class CreateUserRequest {
  @ApiProperty({ description: '사용자명', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '나이', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}
```

## Swagger 문서화

### 태그 구성

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Mohaeng API')
  .setDescription('Mohaeng 백엔드 API')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('users', '사용자 관리')
  .addTag('products', '상품 관리')
  .addTag('orders', '주문 관리')
  .build();
```

### API 응답 타입

```typescript
@ApiResponse({
  status: 200,
  description: '성공',
  schema: {
    example: {
      success: true,
      data: {
        user: { id: 'uuid', name: '홍길동' }
      }
    }
  }
})
```

## 보안 헤더

Helmet이 적용되어 있으며 다음 헤더가 설정됩니다:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- Content Security Policy
