# Mohaeng Backend

모행(Mohaeng)은 여행 코스 공유 및 여행지 추천 플랫폼의 백엔드 서버입니다. 사용자가 자신의 여행 코스를 직접 만들고 공유하거나, 취향 기반으로 여행지를 추천받을 수 있는 서비스입니다.

## 프로젝트 소개

여행을 계획할 때 어디서부터 시작해야 할지 막막한 경험은 누구나 있습니다. 모행은 이런 문제를 해결하기 위해 만들어졌습니다. 사용자가 선호하는 여행 스타일, 환경, 음식 취향 등을 입력하면 그에 맞는 여행 지역을 추천해주고, 다른 사람들이 공유한 여행 코스를 참고해 나만의 여행을 설계할 수 있습니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: MySQL + TypeORM
- **Cache**: Redis (이메일 OTP, 세션 관리)
- **Auth**: JWT, OAuth 2.0 (Google, Kakao, Naver)
- **API Docs**: Swagger (OpenAPI 3.0)

## 주요 기능

**인증**

- 소셜 로그인 지원 (Google, Kakao, Naver)
- 이메일 + OTP 인증
- JWT Access/Refresh Token 기반 인증

**여행 코스**

- 코스 생성, 수정, 삭제
- 코스에 여행지(Place), 해시태그, 방문 국가 연결
- 좋아요 / 북마크 기능
- 공개/비공개 설정

**여행지 추천**

- 국가 및 지역 정보 제공
- 여행 스타일, 환경, 관심사, 음식 취향 등 다차원 속성 기반 추천

**사용자 취향 설정**

- 선호 대륙, 예산, 날씨, 여행 범위, 음식 취향, 주요 관심사 등 세부 설정 가능

**마이페이지**

- 내가 만든 코스, 좋아요한 코스, 북마크한 코스 관리
- 방문한 국가 기록

**블로그**

- 여행 후기 글 작성 및 좋아요

**알림**

- 서비스 내 알림 기능

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- MySQL
- Redis

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 항목을 설정합니다.

```env
# 서버
PORT=8080

# 데이터베이스
DB_HOST=
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SMTP (이메일 OTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# OAuth - Kakao
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URL=

# OAuth - Naver
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_CALLBACK_URL=
```

### 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행 (hot reload)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행 (마이그레이션 자동 적용)
npm run start:prod
```

### 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npm run migration:run

# 마이그레이션 생성
npm run migration:generate -- src/database/migrations/MigrationName

# 마이그레이션 되돌리기
npm run migration:revert
```

## API 문서

서버 실행 후 `/api-docs` 에서 Swagger UI를 통해 전체 API 명세를 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── domain/
│   ├── auth/           # 인증 (소셜 로그인, OTP, JWT)
│   ├── user/           # 사용자 관리
│   ├── course/         # 여행 코스 (좋아요, 북마크 포함)
│   ├── place/          # 여행지
│   ├── country/        # 국가 및 지역 정보
│   ├── preference/     # 사용자 취향 설정
│   ├── visited-country/ # 방문 국가 기록
│   ├── blog/           # 여행 블로그
│   ├── notification/   # 알림
│   ├── admin/          # 관리자
│   └── logging/        # 로깅
├── global/
│   ├── filters/        # 전역 예외 처리
│   └── interceptors/   # 전역 응답 인터셉터
└── database/
    ├── migrations/     # TypeORM 마이그레이션
    └── data-source.ts  # 데이터소스 설정
```

## 개발 작업 플로우

모행 백엔드의 기본 작업 흐름은 다음과 같습니다.

1. GitHub Issue 생성
2. Issue 제목을 `[BE] 작업 내용` 형식의 한국어 제목으로 작성
3. `chore/{issue-number}-{한국어-작업-요약}` 형식으로 브랜치 생성
4. 구현 및 검증
5. `feat (#260) : 로컬 회원 비밀번호 재설정 API 추가` 같은 한국어 제목 + Lore Commit Protocol 형식으로 커밋
6. 브랜치 푸시 및 PR 생성
7. 최종 브리핑 전달

세부 규칙은 루트 `AGENTS.md`를 기준으로 따릅니다.

## 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 커버리지 확인
npm run test:cov
```
