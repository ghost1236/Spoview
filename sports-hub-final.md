# 마이팀 스포츠 허브 — Claude Code 최종 요구사항 문서

> KBO · MLB · K리그 · EPL · 라리가 · 분데스리가 · 세리에A · 리그앙 팀을 골라서 한 화면에서 모두 보는 스포츠 팬 허브 + 커뮤니티 서비스

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 마이팀 스포츠 허브 (가칭) |
| 도메인 | api.smiling.kr (API), myteam.smiling.kr 또는 Vercel 도메인 (프론트) |
| 타겟 | KBO / MLB / K리그 / 유럽 5대리그 팬 |
| 핵심 가치 | "내 팀만 골라서, 한눈에" |
| 수익화 | Google AdSense 배너 최소 적용 (서버비 커버 목적) |

### 커버 리그
- 야구: KBO (10개 구단) / MLB (30개 구단)
- 축구 국내: K리그1 + K리그2
- 축구 해외: EPL / 라리가 / 분데스리가 / 세리에A / 리그앙

---

## 기술 스택

### 프론트엔드
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- 상태관리: Zustand
- 인증: NextAuth.js (카카오 / 구글 OAuth)
- 테마: 라이트 기본 + 다크모드 토글
- 배포: Vercel (무료 플랜)

### 백엔드
- Framework: Spring Boot 3.x
- Language: Kotlin
- DB: MariaDB (새 NCP VPC 서버)
- ORM: JPA + QueryDSL
- 캐시: Redis
- 빌드: JAR (내장 톰캣, 별도 톰캣 설치 불필요)
- 배포: NCP VPC 서버 (새 서버, 기존 Classic과 분리)

### 인프라
- 서버: NCP VPC Standard (2vCPU / 2-4GB)
- 도메인: smiling.kr (가비아, 기존 보유)
- API 서브도메인: api.smiling.kr → 새 NCP VPC 서버
- SSL: Let's Encrypt (Certbot, 무료)
- 웹서버: Nginx (리버스 프록시)
- 포트: 8090 (Spring Boot JAR)

### 데이터 소스
- 축구 API: API-Football v3 (EPL / 라리가 / 분데스리가 / 세리에A / 리그앙 / K리그)
  - 무료 플랜 100 req/day → 새벽 스케줄러로 일괄 수집
  - 7개 리그 커버 시 Pro 플랜($19/월, 7,500 req/day) 전환 권장
- MLB API: MLB Stats API (statsapi.mlb.com, 무료, 인증 불필요)
  - 일정/순위/박스스코어/실시간 스코어 제공
  - Rate limit 없음 (과도한 요청 시 IP 차단 가능, 초당 1-2회 권장)
- 웹 크롤링: KBO 공식 사이트 (Jsoup + ASMX 직접 호출)
  - KBO는 공개 API 없으므로 크롤링으로 보완
- 캐싱: 경기 결과 1시간, 순위 6시간, 실시간 스코어 5분

---

## 디자인 스펙

### 테마
- 기본: 라이트 모드 (흰 배경, 깔끔한 카드)
- 옵션: 다크모드 토글 (우측 상단 해/달 아이콘)
- 전환 시 모든 색상 동시 적용 (배경 · 카드 · 텍스트 · 차트)

### 주요 화면
1. 팀 선택 온보딩 — 리그 탭 필터 + 팀 카드 그리드 + 하단 선택 미리보기
2. 홈 피드 (대시보드) — 스탯 카드 3개 + 막대/레이더 차트 + 경기 카드 + 순위 위젯
3. 팀 상세 — 헤더(폼 배지 + 시즌 스탯) + 탭(경기일정/리그순위/팀스탯/커뮤니티)
4. 커뮤니티 — 게시글 피드 + 카테고리 필터 + 경기 예측 투표
5. 마이페이지 — 구독 팀 관리 + 내 게시글 + 팬 레벨

### 시각화 요소 (홈 피드)
- 막대 그래프: 팀 최근 6경기 득/실점
- 레이더 차트: 내 팀들의 리그 내 순위 백분위
- 라인 차트: 시즌 득/실점 추이 (팀 상세 스탯 탭)
- 도넛 차트: 포지션별 득점 분포
- 폼 배지: W/D/L 컬러 도트
- 순위표 존 구분: 챔스/유로파/강등 등 색상 라벨 + 좌측 컬러 바

---

## 핵심 기능 정의

### 1. 팀 구독 시스템
- 온보딩에서 팀 선택 (기본 선택 없음, 유저가 직접 선택)
- 리그별 탭 필터 (전체 / EPL / 라리가 / 분데스리가 / 세리에A / 리그앙 / KBO / MLB / K리그)
- 비로그인도 팀 선택 후 임시 피드 열람 (LocalStorage)
- 마이페이지에서 구독 팀 변경

### 2. 홈 피드
- 구독 팀들의 오늘 경기 일정 + 최근 결과
- 라이브 스코어 카드 (실시간)
- 팀별 커뮤니티 최신 게시글
- 리그 순위 미니 위젯
- 데이터 시각화 차트

### 3. 팀 상세 페이지
- 탭 구조: 경기 일정 / 리그 순위 / 팀 스탯 / 커뮤니티
- 경기 일정: 최근 결과 + 다가오는 경기 + 팀 내 득점 순위
- 리그 순위: 전체 순위표 + 내 팀 하이라이트 + 존 구분(챔스/유로파/컨퍼런스/강등) 색상 표시
- 팀 스탯: 라인/레이더/도넛 차트
- 커뮤니티: 팀별 게시판

### 4. 커뮤니티
- 팀별 게시판 (자유 / 경기리뷰 / 이적소식)
- 댓글 + 대댓글
- 좋아요 / 반응
- 경기 예측 투표 (경기 전 자동 생성)
- 인기 게시글 TOP3

### 5. 광고 (AdSense)
- 홈 피드 하단 배너 1개
- 팀 상세 사이드 배너 1개
- 커뮤니티 게시글 사이 1개
- 목적: 서버비(월 2-3만원) 커버

---

## DB 스키마

```sql
-- 유저
users (
  id BIGINT PK,
  email VARCHAR(255) UNIQUE,
  nickname VARCHAR(50),
  profile_img VARCHAR(500),
  provider ENUM('kakao','google'),
  provider_id VARCHAR(100),
  fan_level INT DEFAULT 1,
  created_at DATETIME
)

-- 구독
user_team_subscriptions (
  id BIGINT PK,
  user_id BIGINT FK,
  team_code VARCHAR(10),
  league_code VARCHAR(20),
  created_at DATETIME
)

-- 팀 마스터
teams (
  team_code VARCHAR(10) PK,
  league_code VARCHAR(20),
  sport_type ENUM('football','baseball'),
  name_ko VARCHAR(50),
  name_en VARCHAR(50),
  logo_url VARCHAR(500),
  api_football_id INT,
  mlb_team_id INT
)

-- 경기
matches (
  id BIGINT PK,
  league_code VARCHAR(20),
  home_team_code VARCHAR(10),
  away_team_code VARCHAR(10),
  match_date DATETIME,
  home_score INT,
  away_score INT,
  status ENUM('scheduled','live','finished'),
  api_match_id INT,
  created_at DATETIME
)

-- 게시글
posts (
  id BIGINT PK,
  team_code VARCHAR(10),
  user_id BIGINT FK,
  category ENUM('free','review','transfer'),
  title VARCHAR(200),
  content TEXT,
  like_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at DATETIME
)

-- 댓글
comments (
  id BIGINT PK,
  post_id BIGINT FK,
  user_id BIGINT FK,
  parent_id BIGINT,
  content TEXT,
  like_count INT DEFAULT 0,
  created_at DATETIME
)

-- 경기 예측
match_predictions (
  id BIGINT PK,
  match_id BIGINT FK,
  user_id BIGINT FK,
  prediction ENUM('home','draw','away'),
  created_at DATETIME
)
```

---

## API 설계

```
# 팀 / 경기
GET  /api/v1/teams                          # 전체 팀 목록
GET  /api/v1/teams/{teamCode}               # 팀 상세
GET  /api/v1/teams/{teamCode}/matches       # 팀 경기 일정/결과
GET  /api/v1/teams/{teamCode}/standings     # 팀 리그 순위
GET  /api/v1/teams/{teamCode}/stats         # 팀 스탯
GET  /api/v1/leagues/{leagueCode}/standings # 리그 전체 순위

# 피드
GET  /api/v1/feed                           # 내 피드 (인증)
GET  /api/v1/feed/today                     # 오늘 경기 (비인증 가능)

# 구독
GET  /api/v1/subscriptions                  # 내 구독 목록
POST /api/v1/subscriptions                  # 구독 추가
DELETE /api/v1/subscriptions/{teamCode}     # 구독 취소

# 커뮤니티
GET  /api/v1/posts?teamCode=&category=      # 게시글 목록
POST /api/v1/posts                          # 게시글 작성
GET  /api/v1/posts/{postId}                 # 게시글 상세
PUT  /api/v1/posts/{postId}                 # 게시글 수정
DELETE /api/v1/posts/{postId}              # 게시글 삭제
POST /api/v1/posts/{postId}/likes          # 좋아요
POST /api/v1/posts/{postId}/comments       # 댓글 작성

# 예측
GET  /api/v1/matches/{matchId}/prediction  # 예측 현황
POST /api/v1/matches/{matchId}/prediction  # 예측 참여
```

---

## 프로젝트 구조

```
sports-hub/
├── frontend/                        # Next.js 14
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── onboarding/         # 팀 선택 온보딩
│   │   ├── (main)/
│   │   │   ├── page.tsx            # 홈 피드 (대시보드)
│   │   │   ├── team/[code]/        # 팀 상세
│   │   │   ├── community/          # 커뮤니티
│   │   │   └── mypage/             # 마이페이지
│   │   └── api/auth/               # NextAuth
│   ├── components/
│   │   ├── charts/                 # Chart.js 래퍼
│   │   ├── match/                  # 경기 카드
│   │   ├── team/                   # 팀 관련
│   │   └── community/              # 커뮤니티
│   ├── lib/
│   │   ├── api.ts                  # API 클라이언트
│   │   └── store.ts                # Zustand 스토어
│   └── next.config.js
│
└── backend/                         # Spring Boot
    └── src/main/kotlin/
        ├── controller/
        ├── service/
        ├── repository/
        ├── domain/
        ├── crawler/                 # KBO 크롤러 (Jsoup)
        ├── scheduler/               # API-Football 스케줄러
        └── config/
            ├── SecurityConfig.kt
            ├── RedisConfig.kt
            └── CorsConfig.kt
```

---

## 서버 세팅 가이드 (NCP VPC)

### 1단계 — NCP VPC 서버 생성

```
NCP 콘솔 → Server → 서버 생성
- VPC 새로 생성 (sports-hub-vpc)
- Subnet 생성
- 스펙: Standard / 2vCPU / 4GB
- OS: Ubuntu 22.04
- 스토리지: 50GB
- 공인 IP 할당
- ACG(방화벽) 포트 오픈: 22, 80, 443, 8090
```

### 2단계 — 가비아 DNS 설정

```
가비아 → DNS 관리 → 레코드 추가
타입: A
호스트: api
값: 새 NCP VPC 서버 공인 IP
TTL: 300
```

### 3단계 — 서버 기본 세팅

```bash
# 서버 접속
ssh root@새서버IP

# 패키지 업데이트
apt update && apt upgrade -y

# Java 21 설치
apt install -y openjdk-21-jdk

# Nginx 설치
apt install -y nginx

# MariaDB 설치
apt install -y mariadb-server
mysql_secure_installation

# Redis 설치
apt install -y redis-server
systemctl enable redis-server

# Certbot 설치
apt install -y certbot python3-certbot-nginx
```

### 4단계 — MariaDB 세팅

```sql
CREATE DATABASE sports_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sportshub'@'localhost' IDENTIFIED BY '비밀번호';
GRANT ALL PRIVILEGES ON sports_hub.* TO 'sportshub'@'localhost';
FLUSH PRIVILEGES;
```

### 5단계 — Nginx 설정

```nginx
# /etc/nginx/sites-available/sports-hub
server {
    listen 80;
    server_name api.smiling.kr;

    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/sports-hub /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6단계 — SSL 인증서

```bash
# DNS 전파 확인 후 실행 (api.smiling.kr → 새 서버 IP)
certbot --nginx -d api.smiling.kr

# 자동 갱신 확인
certbot renew --dry-run
```

### 7단계 — Spring Boot 배포 스크립트

```bash
# /home/deploy/sports-hub/restart.sh
#!/bin/bash
APP_NAME="sports-hub"
JAR_PATH="/home/deploy/sports-hub/sports-hub.jar"
PID_FILE="/home/deploy/sports-hub/app.pid"
LOG_FILE="/home/deploy/sports-hub/app.log"

if [ -f "$PID_FILE" ]; then
  PID=$(cat $PID_FILE)
  kill $PID 2>/dev/null
  sleep 2
fi

nohup java -Xms256m -Xmx512m \
  -jar $JAR_PATH \
  --spring.profiles.active=prod \
  --server.port=8090 \
  > $LOG_FILE 2>&1 & echo $! > $PID_FILE

echo "Started with PID $(cat $PID_FILE)"
```

```bash
chmod +x /home/deploy/sports-hub/restart.sh
```

### 8단계 — Vercel 프론트 배포

```bash
# GitHub에 푸시
git push origin main

# Vercel 환경변수 설정
NEXT_PUBLIC_API_URL=https://api.smiling.kr
NEXTAUTH_URL=https://myteam.smiling.kr (또는 Vercel 도메인)
NEXTAUTH_SECRET=랜덤문자열32자
KAKAO_CLIENT_ID=카카오앱키
KAKAO_CLIENT_SECRET=카카오시크릿
GOOGLE_CLIENT_ID=구글클라이언트ID
GOOGLE_CLIENT_SECRET=구글시크릿
```

---

## 개발 우선순위 (MVP)

### Phase 1 — 데이터 파이프라인 (1~2주)
1. API-Football 연동 & 스케줄러 (새벽 3시 일괄 수집, 7개 축구 리그)
2. MLB Stats API 연동 & 스케줄러
3. KBO 크롤러 (Jsoup + ASMX)
4. 팀 마스터 데이터 seed (축구 ~120팀 + MLB 30팀 + KBO 10팀)

### Phase 2 — 백엔드 API (2~3주)
1. 팀 조회 / 경기 일정 API
2. 카카오/구글 OAuth
3. 구독 / 피드 API
4. 커뮤니티 CRUD

### Phase 3 — 프론트엔드 (3~4주)
1. 온보딩 (팀 선택)
2. 홈 피드 + 차트
3. 팀 상세 페이지
4. 커뮤니티 게시판

### Phase 4 — 마무리
1. AdSense 배너 적용
2. 경기 예측 투표
3. 팬 레벨 시스템
4. 모바일 반응형 최적화
5. 카카오/구글 OAuth 콜백 URL 등록

---

## Claude Code 실행 지침

### Phase 1 — Research

다음 내용을 깊이/매우 상세히/세부사항까지 분석하여 `research.md`를 작성하라:

1. **API-Football v3 분석**
   - 무료 플랜 제한 (100 req/day) 기준 EPL / 라리가 / 분데스리가 / K리그 수집 전략
   - league_id 목록 (EPL, 라리가, 분데스리가, K리그1, K리그2)
   - 경기 일정 / 결과 / 순위 엔드포인트 응답 스키마 상세
   - 스케줄러 설계 (새벽 3시 일괄 수집, Rate limit 대응)

2. **KBO 크롤링 분석**
   - koreabaseball.com 경기 일정 / 결과 DOM 구조
   - robots.txt 확인 / 동적 렌더링 여부
   - Jsoup으로 처리 가능한지 검토

3. **NCP VPC 서버 환경**
   - Ubuntu 22.04 + Java 21 + Nginx + MariaDB + Redis 구성
   - Spring Boot JAR 배포 방식 (내장 톰캣, 별도 톰캣 불필요)
   - application-prod.yml 필요 항목 목록
   - restart.sh 스크립트 설계

4. **NextAuth.js 설정**
   - 카카오 / 구글 OAuth 설정 항목
   - JWT vs DB 세션 선택 근거
   - Vercel 환경변수 목록

5. **Next.js 14 + Spring Boot 연동**
   - CORS 설정 (api.smiling.kr ↔ Vercel 도메인)
   - next.config.js rewrites 설정
   - Chart.js 연동 (라이트/다크 테마 색상 전환)

6. **Google AdSense 적용**
   - Next.js App Router에서 AdSense 스크립트 삽입 방법
   - 광고 단위 위치 (홈 하단 / 팀 상세 사이드 / 커뮤니티 사이)
   - 서버 사이드 렌더링과 충돌 여부

분석 후 `research.md` 작성. 코드 작성 금지.

---

### Phase 2 — Planning

`research.md` 기반으로 `plan.md`를 작성하라. 포함 항목:

1. 전체 아키텍처 다이어그램
2. DB 스키마 DDL 전체
3. Spring Boot 패키지 구조 & 주요 클래스
4. API-Football 스케줄러 설계 (Cron 주기, 갱신 대상별 주기)
5. KBO 크롤러 클래스 설계
6. Next.js 페이지 / 컴포넌트 트리
7. 인증 플로우 (카카오/구글 OAuth 시퀀스)
8. AdSense 적용 위치 및 방법
9. MVP 범위 확정 & 제외 항목
10. 리스크 & 트레이드오프

`plan.md` 작성 후 승인 대기. 코드 작성 금지.

---

### Phase 3 — Implementation

`plan.md` 승인 후 순서대로 구현:

1. Spring Boot 프로젝트 생성 (Kotlin + JPA + QueryDSL + Redis)
2. DB 마이그레이션 (Flyway)
3. 팀 마스터 데이터 seed (KBO 10팀, K리그, EPL, 라리가, 분데스리가)
4. API-Football 연동 서비스 + 스케줄러
5. KBO 크롤러
6. REST API 전체 구현
7. Next.js 프로젝트 생성
8. NextAuth 설정 (카카오 + 구글)
9. 온보딩 페이지
10. 홈 피드 (차트 포함)
11. 팀 상세 페이지
12. 커뮤니티
13. 마이페이지
14. AdSense 배너 적용
15. 라이트/다크 테마 토글

---

**Phase 1, 2 끝나고 승인 전까지 코드 작성하지 말 것**
