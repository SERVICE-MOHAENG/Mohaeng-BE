# Docker Compose Reverse Proxy Guide

## 목적
- 클라이언트가 포트 없이 도메인으로 호출하도록 Nginx 리버스 프록시를 사용합니다.
- `api`와 `ai` 서버를 같은 인스턴스에서 분리 라우팅합니다.

## 라우팅 구조
- `http://api.example.com` -> `app:8080`
- `http://ai.example.com` -> `ai:8000`

## 필수 환경 변수
- `DOCKER_IMAGE`: NestJS 서버 이미지
- `AI_DOCKER_IMAGE`: AI 서버 이미지
- `API_SERVER_NAME` (선택): API 도메인 (기본값 `api.example.com`)
- `AI_SERVER_NAME` (선택): AI 도메인 (기본값 `ai.example.com`)

## 실행
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 확인
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f nginx
```

## DNS
- `API_SERVER_NAME`, `AI_SERVER_NAME` 두 도메인 모두 같은 인스턴스 공인 IP로 A 레코드를 설정합니다.

## 주의
- Compose 네트워크에서는 `localhost`가 아니라 서비스명을 사용해야 합니다.
- 앱 환경변수의 DB/Redis 호스트는 `db`, `redis`로 설정해야 정상 연결됩니다.
