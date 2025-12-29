# GIT.MD

Mohaeng-BE Git 브랜치 전략 및 커밋 규칙입니다.

## 브랜치 전략

### 주요 브랜치

| 브랜치 | 용도 | CI/CD |
|--------|------|-------|
| `main` | 프로덕션 배포 | ci-production.yml |
| `develop` | 개발 통합 (기본 브랜치) | ci-staging.yml |

### 기능 브랜치 네이밍

```
{type}/{issue-number}-{description}
```

**타입**:
- `feat` - 새로운 기능
- `fix` - 버그 수정
- `chore` - 설정, 의존성 등
- `refactor` - 리팩토링
- `docs` - 문서 수정
- `test` - 테스트 추가/수정
- `ai` - AI 에이전트 작업

**예시**:
```
feat/12-user-authentication
fix/15-login-validation-error
chore/10-ci-pipeline-setup
ai/20251229-18b2b6
```

## 커밋 메시지 형식

```
{type} (#{issue-number}) : {description}
```

**예시**:
```
feat (#12) : 사용자 인증 기능 구현
fix (#15) : 로그인 검증 오류 수정
chore (#10) : axios 설치
chore (#10) : CI 파이프라인 설정
```

## 최근 커밋 히스토리 참고

```
681206f Merge pull request #11: CI 파이프라인 설정
e0ccf8d chore (#10) : axios 설치
eddff49 chore (#10) : 더미 코드 임시 추가
7b8025e chore (#10) : test 서비스 추가
082be4e chore (#10) : staging CI 수정
e0b5cd1 feat (#3) : 중앙 로깅 서비스 구현
6509aca feat (#3) : Discord 서비스 구현
56dba66 feat (#3) : 전역 에러 예외처리 구현
```

## PR 생성 규칙

1. `develop` 브랜치를 기본 타겟으로 설정
2. 기능 브랜치에서 develop으로 PR 생성
3. CI 파이프라인 통과 필수
4. 리뷰 후 머지

## CI/CD 파이프라인

### Staging (develop 브랜치)

```yaml
# .github/workflows/ci-staging.yml
on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

steps:
  - npm ci
  - npm test
  - npm run build
  # lint:check 주석처리 상태
```

### Production (main 브랜치)

```yaml
# .github/workflows/ci-production.yml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

steps:
  - npm ci
  - npm run lint:check  # 활성화
  - npm test
  - npm run build
```

## 워크플로우

```
feature branch
    │
    ▼
develop (스테이징 CI)
    │
    ▼
main (프로덕션 CI)
    │
    ▼
배포
```

## Git 명령어 예시

```bash
# 새 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feat/12-user-auth

# 작업 후 커밋
git add .
git commit -m "feat (#12) : 사용자 인증 기능 구현"

# 푸시
git push origin feat/12-user-auth

# PR 생성 후 머지되면
git checkout develop
git pull origin develop
git branch -d feat/12-user-auth
```

## 주의사항

1. **develop 브랜치가 기본 브랜치**입니다 (main 아님)
2. 커밋 전 반드시 빌드/테스트 통과 확인
3. 커밋 메시지는 한글로 작성
4. 이슈 번호 포함 권장
