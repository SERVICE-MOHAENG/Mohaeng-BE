# CLAUDE.MD

AI 에이전트를 위한 프로젝트 컨텍스트 진입점 문서입니다.

## 문서 구조

이 디렉토리는 AI 에이전트가 Mohaeng-BE 백엔드 프로젝트를 100% 이해할 수 있도록 구성되어 있습니다.

| 파일명 | 설명 |
|--------|------|
| ARCHITECTURE.MD | 시스템 아키텍처 및 DDD 구조 |
| CONVENTION.MD | 코딩 컨벤션, API 스타일 가이드 |
| GIT.MD | Git 브랜치 전략, 커밋 규칙 |
| PROJECT.MD | 프로젝트 개요, 기술 스택 |
| DATABASE.MD | DB 스키마, 엔티티 설계 |
| API_DESIGN.MD | API 설계 원칙, 엔드포인트 패턴 |

## 빠른 시작

프로젝트 파악 순서:
1. PROJECT.MD - 전체 개요 파악
2. ARCHITECTURE.MD - 구조 이해
3. CONVENTION.MD - 코딩 규칙 숙지
4. 나머지 문서 필요시 참조

## 프로젝트 루트 파일

- `CLAUDE.md` - 루트에 있는 원본 코딩 가이드라인 (26개 규칙)
- `package.json` - 의존성 및 스크립트
- `tsconfig.json` - TypeScript 설정

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 린트 체크
npm run lint:check

# 린트 수정
npm run lint
```

## 핵심 규칙 요약

1. **DDD 아키텍처** - 도메인별 폴더 분리 (entity, persistence, presentation, service, exception)
2. **Barrel Export 금지** - `exception/code/index.ts`만 예외
3. **PascalCase 파일명** - `UserController.ts`, `User.entity.ts`
4. **서비스 분리** - ApplicationService(조율) vs Service(비즈니스 로직)
5. **인증 데코레이터** - `@AdminApiBearerAuth`, `@UserApiBearerAuth`
