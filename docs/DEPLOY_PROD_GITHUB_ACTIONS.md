# Prod Deploy Runbook (Docker + GitHub Actions + EC2)

## 0) 현재 배포 구조
1. GitHub Actions가 Docker 이미지를 빌드
2. GHCR(`ghcr.io`)에 이미지를 push
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
- `EC2_USER` (`deploy`)
- `EC2_PORT` (`22`)
- `EC2_SSH_KEY` (deploy private key 전체)
- `APP_DIR` (`/var/www/mohaeng-server-core`)
- `GHCR_USERNAME` (GitHub username)
- `GHCR_TOKEN` (GHCR read 가능한 PAT)

선택:
- `HEALTHCHECK_URL` (예: `http://127.0.0.1:8080/api/health`)

## 4) GHCR 토큰 권한
`GHCR_TOKEN`은 최소 아래 권한 필요:
- `read:packages`

(private repo/package면 필요 시 `repo` 권한도 포함)

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
