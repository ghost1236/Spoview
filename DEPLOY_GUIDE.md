# 스포뷰 배포 가이드

> 최종 수정: 2026-05-12
> 구성: **Vercel (프론트엔드)** + **NCP VPC 서버 1대 (기존 API/CMS + 스포뷰 백엔드 통합)**

---

## 아키텍처

```
[사용자 브라우저]
     │
     ├── 페이지/정적파일 ──→ Vercel (Next.js, CDN)
     │                        spoview.kr
     │
     └── API 호출 ──────────→ NCP VPC 서버 (1대)
                               │
                               ├── Nginx (80/443, SSL, Reverse Proxy)
                               │     │
                               │     ├── api.spoview.kr ───────→ :8090 (Spring Boot JAR, 스포뷰)
                               │     │
                               │     └── smiling.kr ──── path 기반 라우팅
                               │           ├── /DailyFCAnyang_api/ → :8081
                               │           ├── /DailyGiants_api/   → :8082
                               │           ├── /DailyManUtd_api/   → :8083
                               │           └── /cms/               → :8084
                               │
                               ├── MariaDB (기존 DB + sportshub DB)
                               ├── Redis (스포뷰 캐시)
                               └── Object Storage (이미지)
```

---

## Part A. Vercel (프론트엔드)

### A-1. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) 가입 (GitHub 연동)
2. **New Project** → GitHub 레포 선택
3. **Root Directory**: `frontend` 입력
4. **Framework Preset**: Next.js (자동 감지)
5. **Build Command**: `npm run build` (기본값)
6. **Output Directory**: `.next` (기본값)

### A-2. 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `NEXTAUTH_URL` | `https://spoview.kr` | Production |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | All |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 | All |
| `KAKAO_CLIENT_SECRET` | 카카오 시크릿 | All |
| `NAVER_CLIENT_ID` | 네이버 Client ID | All |
| `NAVER_CLIENT_SECRET` | 네이버 Client Secret | All |
| `GOOGLE_CLIENT_ID` | 구글 Client ID | All |
| `GOOGLE_CLIENT_SECRET` | 구글 Client Secret | All |
| `NEXT_PUBLIC_API_URL` | `https://api.spoview.kr` | All |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID 공개키 | All |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | `ca-pub-XXX` | Production |

### A-3. 도메인 설정

1. Vercel 대시보드 → Settings → Domains
2. `spoview.kr` 추가
3. DNS에서 Vercel이 안내하는 레코드 설정:
   - `spoview.kr` → A레코드 `76.76.21.21`
   - `www.spoview.kr` → CNAME `cname.vercel-dns.com`
4. SSL 자동 발급됨

### A-4. 배포

```bash
git push origin master  # 자동 빌드 & 배포
```

Preview 배포: PR 생성 시 자동으로 프리뷰 URL 생성

---

## Part B. NCP VPC 생성 및 서버 구축

### B-1. VPC 환경 생성

**NCP 콘솔 → VPC → VPC 생성**

```
VPC 이름: smiling-vpc
IP 대역:  10.0.0.0/16
```

**서브넷 생성:**

| 서브넷 | CIDR | 용도 |
|--------|------|------|
| public-subnet | 10.0.1.0/24 | 서버 배치 |

**NAT Gateway**: 외부 API 호출용 (API-Football, MLB 등) — 필요 시 생성

### B-2. 서버 생성

**NCP 콘솔 → Server → 서버 생성**

| 항목 | 설정 |
|------|------|
| VPC | smiling-vpc |
| 서브넷 | public-subnet |
| OS | Ubuntu 22.04 |
| 스펙 | vCPU 2 / RAM 4GB / SSD 50GB |
| 인증키 | `.pem` 파일 다운로드 |

> 4GB: 스케줄러 시간 분산으로 동시 피크 회피. 트래픽 증가 시 8GB 업그레이드 가능

### B-3. ACG (방화벽)

**NCP 콘솔 → VPC → ACG → 규칙 추가:**

| 프로토콜 | 포트 | 소스 | 용도 |
|----------|------|------|------|
| TCP | 22 | 관리자 IP | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP → HTTPS 리다이렉트 |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 3306 | 10.0.0.0/16 | MariaDB (VPC 내부만) |

> 8080, 8090 포트는 외부 노출 불필요 (Nginx가 프록시)

### B-4. 공인 IP + 도메인

1. **공인 IP** 할당: NCP 콘솔 → 공인 IP 신청 → 서버에 연결
2. **DNS 레코드** 설정:

| 도메인 | 타입 | 값 |
|--------|------|-----|
| `api.spoview.kr` | A | VPC 공인 IP |
| `smiling.kr` | A | VPC 공인 IP |

---

## Part C. 서버 초기 설정

### C-1. 기본 패키지 설치

```bash
# SSH 접속
ssh -i spoview-key.pem root@공인IP

# 기본 패키지
apt update && apt upgrade -y
apt install -y git curl wget nginx certbot python3-certbot-nginx

# Java 17 (Spring Boot JAR 2개 공용)
apt install -y openjdk-17-jdk
```

### C-2. MariaDB 설치

```bash
apt install -y mariadb-server
systemctl enable mariadb
mysql_secure_installation
```

```sql
-- 기존 DB 생성 (또는 덤프에서 복원)
CREATE DATABASE 기존DB명 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 스포뷰 DB 생성
CREATE DATABASE sportshub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성
CREATE USER '기존유저'@'localhost' IDENTIFIED BY '기존비밀번호';
GRANT ALL PRIVILEGES ON 기존DB명.* TO '기존유저'@'localhost';

CREATE USER 'sportshub'@'localhost' IDENTIFIED BY '스포뷰비밀번호';
GRANT ALL PRIVILEGES ON sportshub.* TO 'sportshub'@'localhost';

FLUSH PRIVILEGES;
```

### C-3. Redis 설치

```bash
apt install -y redis-server
systemctl enable redis-server

# 메모리 제한 설정 (8GB 서버 기준)
sed -i 's/# maxmemory <bytes>/maxmemory 512mb/' /etc/redis/redis.conf
sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl restart redis-server
```

---

## Part D. 기존 클래식 서버 → VPC 마이그레이션

### D-1. 기존 DB 덤프 (클래식 서버에서)

```bash
# 클래식 서버에서 실행
mysqldump -u root -p 기존DB명 > /tmp/legacy_dump.sql

# 로컬로 다운로드
scp -i classic-key.pem root@클래식IP:/tmp/legacy_dump.sql ./
```

### D-2. VPC 서버에 DB 복원

```bash
# VPC 서버로 업로드
scp -i spoview-key.pem legacy_dump.sql root@VPC공인IP:/tmp/

# VPC 서버에서 복원
mysql -u root -p 기존DB명 < /tmp/legacy_dump.sql
```

### D-3. 기존 서비스 디렉토리 구성

```bash
# VPC 서버에 각 서비스별 디렉토리 생성
mkdir -p /opt/daily-fcanyang
mkdir -p /opt/daily-giants
mkdir -p /opt/daily-manutd
mkdir -p /opt/daily-cms
```

### D-4. 각 서비스 JAR 빌드 & 업로드

```bash
# 로컬 또는 클래식 서버에서 각 프로젝트 빌드
# (각 프로젝트 디렉토리에서)
./gradlew bootJar -x test   # 또는: mvn package -DskipTests

# VPC 서버로 업로드
scp -i spoview-key.pem DailyFCAnyang_api.jar root@VPC공인IP:/opt/daily-fcanyang/
scp -i spoview-key.pem DailyGiants_api.jar   root@VPC공인IP:/opt/daily-giants/
scp -i spoview-key.pem DailyManUtd_api.jar   root@VPC공인IP:/opt/daily-manutd/
scp -i spoview-key.pem cms.jar               root@VPC공인IP:/opt/daily-cms/
```

### D-5. systemd 서비스 등록 (4개)

각 서비스별 포트를 지정하고, context-path를 기존과 동일하게 유지합니다.

```bash
# --- DailyFCAnyang API (:8081) ---
cat > /etc/systemd/system/daily-fcanyang.service << 'EOF'
[Unit]
Description=DailyFCAnyang API
After=mariadb.service

[Service]
User=root
WorkingDirectory=/opt/daily-fcanyang
ExecStart=/usr/bin/java -jar -Xms128m -Xmx256m \
  -Dserver.port=8081 \
  -Dserver.servlet.context-path=/DailyFCAnyang_api \
  -Dspring.profiles.active=prod \
  /opt/daily-fcanyang/DailyFCAnyang_api.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# --- DailyGiants API (:8082) ---
cat > /etc/systemd/system/daily-giants.service << 'EOF'
[Unit]
Description=DailyGiants API
After=mariadb.service

[Service]
User=root
WorkingDirectory=/opt/daily-giants
ExecStart=/usr/bin/java -jar -Xms128m -Xmx256m \
  -Dserver.port=8082 \
  -Dserver.servlet.context-path=/DailyGiants_api \
  -Dspring.profiles.active=prod \
  /opt/daily-giants/DailyGiants_api.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# --- DailyManUtd API (:8083) ---
cat > /etc/systemd/system/daily-manutd.service << 'EOF'
[Unit]
Description=DailyManUtd API
After=mariadb.service

[Service]
User=root
WorkingDirectory=/opt/daily-manutd
ExecStart=/usr/bin/java -jar -Xms128m -Xmx256m \
  -Dserver.port=8083 \
  -Dserver.servlet.context-path=/DailyManUtd_api \
  -Dspring.profiles.active=prod \
  /opt/daily-manutd/DailyManUtd_api.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# --- CMS (:8084) ---
cat > /etc/systemd/system/daily-cms.service << 'EOF'
[Unit]
Description=Daily CMS
After=mariadb.service

[Service]
User=root
WorkingDirectory=/opt/daily-cms
ExecStart=/usr/bin/java -jar -Xms128m -Xmx256m \
  -Dserver.port=8084 \
  -Dserver.servlet.context-path=/cms \
  -Dspring.profiles.active=prod \
  /opt/daily-cms/cms.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 전체 활성화
systemctl daemon-reload
systemctl enable daily-fcanyang daily-giants daily-manutd daily-cms
systemctl start daily-fcanyang daily-giants daily-manutd daily-cms
```

> 스케줄러 시간을 분산 배치하여 동시 피크 회피 (01:00/02:00/03:00/04:00). DB 접속정보는 각 JAR 내부 `application-prod.yml`에 `localhost:3306`으로 설정.

### D-6. 기존 서비스 동작 확인

```bash
# 각 서비스 로그 확인
journalctl -u daily-fcanyang -n 20 --no-pager
journalctl -u daily-giants -n 20 --no-pager
journalctl -u daily-manutd -n 20 --no-pager
journalctl -u daily-cms -n 20 --no-pager

# 동작 확인
curl http://localhost:8081/DailyFCAnyang_api/health
curl http://localhost:8082/DailyGiants_api/health
curl http://localhost:8083/DailyManUtd_api/health
curl http://localhost:8084/cms/health
```

---

## Part E. 스포뷰 백엔드 배포

### E-1. 소스 클론 & 빌드

```bash
cd /opt
git clone https://github.com/your-repo/SportsHub.git
cd SportsHub/backend
```

### E-2. 환경변수

```bash
cat > /opt/SportsHub/backend/.env << 'EOF'
DB_URL=jdbc:mariadb://localhost:3306/sportshub
DB_USERNAME=sportshub
DB_PASSWORD=스포뷰비밀번호
JWT_SECRET=openssl_rand_-base64_64로_생성
VAPID_PUBLIC_KEY=VAPID_공개키
VAPID_PRIVATE_KEY=VAPID_비공개키
NCLOUD_ACCESS_KEY=네이버클라우드_Access_Key
NCLOUD_SECRET_KEY=네이버클라우드_Secret_Key
NCLOUD_BUCKET=sportshub-images
API_FOOTBALL_KEY=API_Football_키
EOF
```

### E-3. 빌드 & 실행

```bash
chmod +x gradlew
./gradlew bootJar -x test

# systemd 서비스
cat > /etc/systemd/system/sportshub-api.service << 'EOF'
[Unit]
Description=SportsHub Backend API
After=mariadb.service redis-server.service

[Service]
User=root
WorkingDirectory=/opt/SportsHub/backend
EnvironmentFile=/opt/SportsHub/backend/.env
ExecStart=/usr/bin/java -jar -Xms256m -Xmx512m -Dspring.profiles.active=prod build/libs/sportshub-*.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sportshub-api
systemctl start sportshub-api
```

---

## Part F. Nginx 통합 설정 (핵심)

### F-1. 스포뷰 API (api.spoview.kr → :8090)

```bash
cat > /etc/nginx/sites-available/spoview-api << 'NGINX'
server {
    listen 80;
    server_name api.spoview.kr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.spoview.kr;

    ssl_certificate /etc/letsencrypt/live/api.spoview.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.spoview.kr/privkey.pem;

    # CORS 설정 (Vercel 프론트에서 호출)
    add_header Access-Control-Allow-Origin "https://spoview.kr" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;

    if ($request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    location /uploads/ {
        alias /opt/SportsHub/backend/uploads/;
    }
}
NGINX
```

### F-2. 기존 서비스 (smiling.kr → path별 분기)

```bash
cat > /etc/nginx/sites-available/smiling << 'NGINX'
server {
    listen 80;
    server_name smiling.kr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name smiling.kr;

    ssl_certificate /etc/letsencrypt/live/smiling.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smiling.kr/privkey.pem;

    # DailyFCAnyang API → :8081
    location /DailyFCAnyang_api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # DailyGiants API → :8082
    location /DailyGiants_api/ {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # DailyManUtd API → :8083
    location /DailyManUtd_api/ {
        proxy_pass http://127.0.0.1:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # CMS → :8084
    location /cms/ {
        proxy_pass http://127.0.0.1:8084;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
}
NGINX
```

### F-3. Nginx 활성화 & SSL

```bash
# 사이트 활성화
ln -sf /etc/nginx/sites-available/spoview-api /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/smiling /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 설정 검증
nginx -t

# SSL 발급 (HTTP 상태에서 먼저)
# 임시로 80 포트 설정만 활성화 후:
certbot --nginx -d api.spoview.kr -d smiling.kr

# Nginx 재시작
systemctl restart nginx
```

---

## Part G. 메모리 & 포트 요약

### 포트 매핑

| 포트 | 서비스 | 외부 노출 |
|------|--------|----------|
| 80 | Nginx (HTTP → HTTPS) | O |
| 443 | Nginx (HTTPS) | O |
| 8081 | DailyFCAnyang API | X (Nginx만) |
| 8082 | DailyGiants API | X (Nginx만) |
| 8083 | DailyManUtd API | X (Nginx만) |
| 8084 | CMS | X (Nginx만) |
| 8090 | 스포뷰 API | X (Nginx만) |
| 3306 | MariaDB | X (localhost만) |
| 6379 | Redis | X (localhost만) |

### 서버 스펙 검토

Tomcat 제거로 오버헤드가 줄어, **4GB로도 운영 가능**합니다.

#### 4GB 서버 — 메모리 분배 (스케줄러 시간 분산 전제)

| 서비스 | 할당 | 설정 |
|--------|------|------|
| DailyFCAnyang API (스케줄러 01:00) | 256MB | `-Xms128m -Xmx256m` |
| DailyGiants API (스케줄러 02:00) | 256MB | `-Xms128m -Xmx256m` |
| DailyManUtd API (스케줄러 04:00) | 256MB | `-Xms128m -Xmx256m` |
| CMS | 256MB | `-Xms128m -Xmx256m` |
| 스포뷰 API (스케줄러 03:00) | 512MB | `-Xms256m -Xmx512m` |
| MariaDB | ~1GB | `innodb_buffer_pool_size=512M` |
| Redis | 512MB | `maxmemory 512mb` |
| OS + Nginx | ~1GB | - |
| **합계** | **~4GB** | - |

> 스케줄러 실행 시간을 1시간 간격으로 분산하여 동시 메모리 피크 회피.
> 트래픽 증가 시 NCP 콘솔에서 8GB로 업그레이드 가능.

---

## Part H. 추가 설정

### H-1. Object Storage 버킷

1. NCP 콘솔 → Object Storage → 버킷 생성: `sportshub-images`
2. 접근 제어: 공개 읽기
3. (선택) CDN+ 연결

### H-2. 소셜 로그인 Callback URL 업데이트

| 서비스 | Callback URL |
|--------|-------------|
| 카카오 | `https://spoview.kr/api/auth/callback/kakao` |
| 네이버 | `https://spoview.kr/api/auth/callback/naver` |
| 구글 | `https://spoview.kr/api/auth/callback/google` |

> Callback URL은 **Vercel 도메인** 기준 (프론트에서 NextAuth가 처리)

### H-3. Next.js API 프록시 설정

`frontend/next.config.js`:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.spoview.kr/api/v1/:path*',
      },
    ];
  },
};
```

### H-4. Spring Boot CORS 설정 확인

`SecurityConfig.kt` 또는 `CorsConfig.kt`에서 Vercel 도메인 허용:

```kotlin
// 허용 origin에 추가
"https://spoview.kr"
"https://www.spoview.kr"
```

---

## Part I. 배포 후 체크리스트

| 순서 | 확인 사항 | 방법 |
|------|----------|------|
| 1 | 기존 API 동작 | `curl https://smiling.kr/DailyFCAnyang_api/health` |
| 1-1 | 기존 API 동작 | `curl https://smiling.kr/DailyGiants_api/health` |
| 1-2 | 기존 API 동작 | `curl https://smiling.kr/DailyManUtd_api/health` |
| 1-3 | CMS 동작 | `curl https://smiling.kr/cms/health` |
| 2 | 스포뷰 백엔드 동작 | `curl https://api.spoview.kr/actuator/health` |
| 3 | Vercel 프론트 실행 | `https://spoview.kr` 접속 |
| 4 | API 프록시 연결 | `https://spoview.kr/api/v1/leagues` |
| 5 | 카카오 로그인 | 로그인 테스트 |
| 6 | 네이버 로그인 | 로그인 테스트 |
| 7 | 구글 로그인 | 로그인 테스트 |
| 8 | 이미지 업로드 | 커뮤니티 글 작성 시 이미지 첨부 |
| 9 | 데이터 수집 | 스케줄러 로그 확인 |
| 10 | 웹 푸시 | 알림 설정 후 테스트 |
| 11 | 기존 DB 데이터 정합성 | 기존 CMS에서 데이터 조회 확인 |

---

## Part J. 업데이트 배포

### 프론트엔드 (자동)

```bash
git push origin master  # Vercel이 자동 빌드 & 배포
```

### 스포뷰 백엔드 (수동)

```bash
cd /opt/SportsHub
git pull origin master
cd backend
./gradlew bootJar -x test
systemctl restart sportshub-api
```

### 기존 서비스 (수동, 개별)

```bash
# 예: DailyFCAnyang API 업데이트
cp DailyFCAnyang_api-new.jar /opt/daily-fcanyang/DailyFCAnyang_api.jar
systemctl restart daily-fcanyang

# 예: CMS 업데이트
cp cms-new.jar /opt/daily-cms/cms.jar
systemctl restart daily-cms
```

### 통합 배포 스크립트

```bash
#!/bin/bash
# /opt/deploy-all.sh
echo "=== 통합 배포 시작 ==="

# 스포뷰 백엔드
echo "[1/2] 스포뷰 백엔드 배포..."
cd /opt/SportsHub
git pull origin master
cd backend
./gradlew bootJar -x test
systemctl restart sportshub-api

echo "[2/2] 상태 확인..."
sleep 3
systemctl status sportshub-api --no-pager
systemctl status daily-fcanyang --no-pager
systemctl status daily-giants --no-pager
systemctl status daily-manutd --no-pager
systemctl status daily-cms --no-pager

echo "=== 배포 완료 ==="
echo "스포뷰:    $(curl -s https://api.spoview.kr/actuator/health)"
echo "FCAnyang:  $(curl -s https://smiling.kr/DailyFCAnyang_api/health)"
echo "Giants:    $(curl -s https://smiling.kr/DailyGiants_api/health)"
echo "ManUtd:    $(curl -s https://smiling.kr/DailyManUtd_api/health)"
echo "CMS:       $(curl -s https://smiling.kr/cms/health)"
```

---

## Part K. 트러블슈팅

### 기존 서비스가 안 뜰 때
```bash
# 로그 확인 (서비스명 변경)
journalctl -u daily-fcanyang -n 50 --no-pager
journalctl -u daily-giants -n 50 --no-pager
journalctl -u daily-manutd -n 50 --no-pager
journalctl -u daily-cms -n 50 --no-pager

# DB 연결 확인 (localhost로 변경했는지)
mysql -u 기존유저 -p 기존DB명 -e "SELECT 1"

# 포트 충돌 확인
lsof -i :8081 -i :8082 -i :8083 -i :8084
```

### 스포뷰 백엔드가 안 뜰 때
```bash
journalctl -u sportshub-api -n 50 --no-pager
# DB 연결 실패 → .env 확인
# 포트 충돌 → lsof -i :8090
```

### Vercel 빌드 실패
- Vercel 대시보드 → Deployments → 빌드 로그 확인
- 로컬에서 `npm run build` 성공하는지 먼저 확인
- 환경변수 누락 체크

### API 호출 실패 (CORS)
- Nginx CORS 헤더 확인
- Spring Boot CORS 설정에 `https://spoview.kr` 허용되어 있는지
- `next.config.js` rewrites 프록시 사용 시 CORS 불필요

### 메모리 부족
```bash
free -h
# Spring Boot JAR 힙 줄이기 (-Xmx768m 등)
# MariaDB innodb_buffer_pool_size 줄이기
```

### SSL 갱신
```bash
certbot renew --force-renewal
systemctl restart nginx
# Vercel은 자동 갱신
```

---

## Part L. 마이그레이션 체크리스트

클래식 → VPC 이전 시 순서:

| 순서 | 작업 | 완료 |
|------|------|------|
| 1 | VPC + 서브넷 + ACG 생성 | ☐ |
| 2 | VPC 서버 생성 + 공인 IP 할당 | ☐ |
| 3 | 기본 패키지 설치 (Java, Nginx, MariaDB, Redis) | ☐ |
| 4 | 클래식 DB 덤프 → VPC로 복원 | ☐ |
| 5 | 기존 서비스 JAR 빌드 + 배포 + DB 접속정보 변경 | ☐ |
| 7 | 기존 서비스 동작 확인 | ☐ |
| 8 | 스포뷰 백엔드 배포 | ☐ |
| 9 | Nginx 통합 설정 + SSL 발급 | ☐ |
| 10 | DNS 레코드 VPC 공인 IP로 변경 | ☐ |
| 11 | 전체 서비스 통합 테스트 | ☐ |
| 12 | 클래식 서버 중지 (확인 후) | ☐ |

---

## Part M. 월 예상 비용

| 항목 | 비용 |
|------|------|
| Vercel (Hobby 플랜) | 무료 |
| NCP VPC 서버 (Standard, 2vCPU/4GB) | ~₩30,000/월 |
| NCP 공인 IP | ~₩3,600/월 |
| Object Storage (10GB 이내) | ~₩500/월 |
| 도메인 (.kr) | ~₩18,000/년 |
| API-Football Pro | ~$19/월 |
| **합계** | **~₩60,000/월** |

> - 클래식 서버 폐기 시 그 비용이 절감됨
> - JAR 5개(기존 4 + 스포뷰 1) 모두 4GB 서버 1대에서 운영
> - 트래픽 증가 시 NCP 콘솔에서 8GB로 스펙 변경 가능
> - Vercel Hobby 플랜: 개인 프로젝트 무료, 상업적 사용 시 Pro ($20/월)
