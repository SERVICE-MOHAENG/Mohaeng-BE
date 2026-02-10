# PROJECT.MD

Mohaeng-BE 백엔드 프로젝트 개요 문서입니다.

## 프로젝트 정보

- **프로젝트명**: Mohaeng-server-core
- **버전**: 0.0.1
- **프레임워크**: NestJS 11.0
- **언어**: TypeScript 5.7
- **런타임**: Node.js 20
- **기본 포트**: 8080
- **API 접두어**: `/api`

## 기술 스택

### 핵심 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @nestjs/common | ^11.0.1 | NestJS 핵심 |
| @nestjs/core | ^11.0.1 | NestJS 코어 |
| @nestjs/config | ^4.0.2 | 환경 설정 관리 |
| @nestjs/swagger | ^11.2.3 | API 문서화 |
| axios | ^1.13.2 | HTTP 클라이언트 |
| class-validator | ^0.14.3 | DTO 검증 |
| class-transformer | ^0.5.1 | DTO 변환 |
| helmet | ^8.1.0 | 보안 헤더 |

### 개발 도구

| 패키지 | 버전 | 용도 |
|--------|------|------|
| TypeScript | 5.7.3 | 타입 시스템 |
| Jest | 29.7.0 | 테스트 프레임워크 |
| ESLint | 9.x | 코드 정적 분석 |
| Prettier | 3.x | 코드 포맷팅 |

## 디렉토리 구조

```
Mohaeng-BE/
├── src/
│   ├── main.ts                 # 애플리케이션 진입점
│   ├── app.module.ts           # 루트 모듈
│   ├── domain/                 # 도메인 계층
│   │   └── logging/            # 로깅 도메인
│   │       ├── service/
│   │       └── test/
│   └── global/                 # 전역 설정
│       ├── decorators/         # 커스텀 데코레이터
│       ├── dto/                # 전역 DTO
│       ├── exception/          # 전역 예외
│       ├── filters/            # 전역 필터
│       ├── interceptors/       # 전역 인터셉터
│       └── logger/             # 로깅 시스템
├── test/                       # E2E 테스트
├── .github/workflows/          # CI/CD 파이프라인
└── .agents/                    # AI 에이전트 컨텍스트
```

## 도메인 상태

### 활성 도메인
- **logging** - 로깅 서비스 (구현 중)

### 계획된 도메인
- **admin** - 관리자 (활성화 예정)
- **user** - 사용자 (entity + presentation만 존재)
- **point** - 포인트 (활성화 예정)
- **service** - 서비스 (활성화 예정)
- **catalog** - 카탈로그 (컨트롤러 주석처리)
- **product** - 상품 (컨트롤러 주석처리)
- **likes** - 좋아요 (컨트롤러 주석처리)

## 현재 구현 상태

### 완료 항목
- NestJS 기본 설정
- Swagger 문서화 통합
- 전역 예외 처리 (10개 Exception 클래스)
- 전역 인터셉터/필터
- Discord 로깅 통합
- 인증 데코레이터 스켈레톤
- CI/CD 파이프라인 (staging/production)

### 미완료 항목
- TypeORM 데이터베이스 통합
- 인증 Guards 구현 (AdminGuard, JwtAuthGuard)
- 실제 도메인 비즈니스 로직
- 통합 테스트 작성

## 주요 스크립트

```bash
# 개발
npm run dev          # 개발 서버 (watch 모드)
npm run start:debug  # 디버그 모드

# 빌드 & 배포
npm run build        # 프로덕션 빌드
npm run start:prod   # 프로덕션 실행

# 테스트
npm test             # 유닛 테스트
npm run test:watch   # 테스트 watch 모드
npm run test:cov     # 커버리지 측정
npm run test:e2e     # E2E 테스트

# 코드 품질
npm run lint         # 린트 + 자동 수정
npm run lint:check   # 린트 체크만
npm run format       # Prettier 포맷팅
```

## 환경 설정

### 환경 변수
- `PORT` - 서버 포트 (기본: 8080)
- Discord 웹훅 설정 (DiscordService에서 사용)

### API 문서
- Swagger UI: `http://localhost:8080/api-docs`
