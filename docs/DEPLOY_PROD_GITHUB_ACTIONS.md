# Prod Deploy Runbook (Docker Hub + GitHub Actions + EC2)

## 0) 현재 배포 구조
1. GitHub Actions가 Docker 이미지를 빌드
2. Docker Hub(`docker.io`)에 이미지를 push
3. EC2가 해당 이미지를 pull
4. `docker compose up -d`로 컨테이너 교체

## 1) EC2 1회 세팅
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Docker 설치
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# deploy 유저가 docker 실행 가능하도록
sudo usermod -aG docker deploy

# 앱 디렉토리 준비
sudo mkdir -p /var/www/mohaeng-server-core
sudo chown -R deploy:deploy /var/www/mohaeng-server-core
```

`deploy`로 재로그인 후 확인:
```bash
docker --version
docker compose version
```

## 2) 서버 환경 파일 준비
EC2에 생성:
```bash
nano /var/www/mohaeng-server-core/.env
```

## 3) GitHub Secrets
Repository -> Settings -> Secrets and variables -> Actions

필수:
- `EC2_HOST`
- `EC2_USER` (`ubuntu` 또는 `deploy`)
- `EC2_PORT` (`22`)
- `EC2_SSH_KEY` (EC2 접속용 private key 전체)
- `APP_DIR` (`/var/www/mohaeng-server-core`)
- `DOCKERHUB_USERNAME` (Docker Hub username)
- `DOCKERHUB_TOKEN` (Docker Hub access token or password)

선택:
- `HEALTHCHECK_URL` (예: `http://127.0.0.1:8080/api/health`)
- `DOCKERHUB_IMAGE` (예: `dongguli08/mohaeng`)

## 4) Docker Hub 토큰
private repository면 EC2에서 pull 하려면 로그인 필요합니다.
- 권장: Docker Hub Access Token 발급 후 `DOCKERHUB_TOKEN`으로 사용

## 5) 배포 실행
- `main` push 또는 Actions에서 `Deploy Prod` 수동 실행
- 성공 시 EC2에서 최신 이미지로 교체됨

## 6) 운영 확인
EC2에서:
```bash
cd /var/www/mohaeng-server-core
docker compose --env-file .deploy.env -f docker-compose.prod.yml ps
docker compose --env-file .deploy.env -f docker-compose.prod.yml logs -n 100
```

## 7) 참고
- 현재 컨테이너 시작 명령은 `npm run start:prod`입니다.
- 이 스크립트는 마이그레이션을 포함하므로, 앱 시작 시 migration이 실행됩니다.
