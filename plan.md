# 마이팀 스포츠 허브 — Phase 2 Plan

> 작성일: 2026-05-06 | 기반: research.md
> 커버: 축구 7개 리그(유럽 5대 + K리그1/2) + 야구 2개(KBO + MLB) = 총 ~160팀

---

## 1. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     사용자 (브라우저)                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel (Next.js 14 App Router)              │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐  │
│  │ 온보딩    │ │ 홈 피드   │ │ 팀 상세    │ │ 커뮤니티  │  │
│  │ 페이지    │ │ 대시보드  │ │ 페이지     │ │ 게시판   │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ NextAuth.js (카카오/구글 OAuth → JWT)              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Zustand Store / react-chartjs-2 / next-themes     │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (Bearer JWT)
                         │ rewrites proxy + CORS
                         ▼
┌─────────────────────────────────────────────────────────┐
│          NCP VPC Server (Ubuntu 22.04)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Nginx (80/443, SSL, Reverse Proxy)       │   │
│  └──────────────────────────┬───────────────────────┘   │
│                              │ :8090                     │
│  ┌──────────────────────────▼───────────────────────┐   │
│  │          Spring Boot 3.x (Kotlin, JAR)            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐  │   │
│  │  │ Controller │→│  Service   │→│  Repository  │  │   │
│  │  └────────────┘ └────────────┘ └──────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │ Scheduler (Cron)                            │   │   │
│  │  │ ├─ FootballDataScheduler (API-Football)     │   │   │
│  │  │ ├─ MlbDataScheduler (MLB Stats API)         │   │   │
│  │  │ └─ KboDataScheduler (크롤링)                 │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  MariaDB      │  │  Redis 7.x   │                     │
│  │  (영구 저장)   │  │  (캐시/TTL)   │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
                         ▲
          ┌──────────────┼──────────────┐
          │              │              │
   API-Football v3   MLB Stats API   KBO 크롤링
   (축구 7개 리그)    (MLB 30팀)     (Jsoup+ASMX)
```

---

## 2. DB 스키마 DDL

```sql
-- ============================================
-- 1. 유저
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    profile_img VARCHAR(500),
    provider ENUM('kakao', 'google') NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    fan_level INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 리그 마스터
-- ============================================
CREATE TABLE leagues (
    league_code VARCHAR(20) PRIMARY KEY,       -- 'epl', 'laliga', 'bundesliga', 'seriea', 'ligue1', 'kleague1', 'kleague2', 'kbo', 'mlb'
    sport_type ENUM('football', 'baseball') NOT NULL,
    name_ko VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    api_football_id INT,                       -- 축구 리그용
    logo_url VARCHAR(500),
    season_year INT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 팀 마스터
-- ============================================
CREATE TABLE teams (
    team_code VARCHAR(10) PRIMARY KEY,         -- 'mci', 'liv', 'nyy', 'ssg' 등 약어
    league_code VARCHAR(20) NOT NULL,
    sport_type ENUM('football', 'baseball') NOT NULL,
    name_ko VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    logo_url VARCHAR(500),
    api_football_id INT,                       -- API-Football team id
    mlb_team_id INT,                           -- MLB Stats API team id
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    INDEX idx_league (league_code),
    INDEX idx_sport (sport_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 유저 팀 구독
-- ============================================
CREATE TABLE user_team_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    team_code VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    UNIQUE KEY uk_user_team (user_id, team_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. 경기
-- ============================================
CREATE TABLE matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    sport_type ENUM('football', 'baseball') NOT NULL,
    home_team_code VARCHAR(10) NOT NULL,
    away_team_code VARCHAR(10) NOT NULL,
    match_date DATETIME NOT NULL,
    home_score INT,
    away_score INT,
    status ENUM('scheduled', 'live', 'finished', 'postponed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    round VARCHAR(50),                         -- 'Regular Season - 5' 또는 'Game 42'
    venue VARCHAR(100),
    api_match_id VARCHAR(20),                  -- API-Football fixture id 또는 MLB gamePk
    extra_data JSON,                           -- 야구: 이닝별 스코어 등
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    FOREIGN KEY (home_team_code) REFERENCES teams(team_code),
    FOREIGN KEY (away_team_code) REFERENCES teams(team_code),
    INDEX idx_league_date (league_code, match_date),
    INDEX idx_team_date (home_team_code, match_date),
    INDEX idx_status (status),
    INDEX idx_api_match (api_match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 리그 순위
-- ============================================
CREATE TABLE standings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    team_code VARCHAR(10) NOT NULL,
    season_year INT NOT NULL,
    rank_position INT NOT NULL,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,              -- 축구용
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,          -- 축구: 득점, 야구: 득점(runs_scored)
    goals_against INT NOT NULL DEFAULT 0,      -- 축구: 실점, 야구: 실점(runs_allowed)
    goal_diff INT NOT NULL DEFAULT 0,          -- 축구: 골득실, 야구: 득실차
    points INT NOT NULL DEFAULT 0,             -- 축구용 (야구는 0)
    winning_pct VARCHAR(10),                   -- 야구용: '.676'
    games_back VARCHAR(10),                    -- 야구용: '2.5' 또는 '-'
    form VARCHAR(10),                          -- 축구: 'WWDLW', 야구: streak 'W3'
    zone_description VARCHAR(100),             -- 'Champions League', 'Relegation' 등
    division VARCHAR(50),                      -- MLB: 'American League East' 등
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    UNIQUE KEY uk_league_team_season (league_code, team_code, season_year),
    INDEX idx_league_season_rank (league_code, season_year, rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 게시글
-- ============================================
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code VARCHAR(10) NOT NULL,
    user_id BIGINT NOT NULL,
    category ENUM('free', 'review', 'transfer') NOT NULL DEFAULT 'free',
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_team_category (team_code, category),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. 댓글
-- ============================================
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,                          -- 대댓글 (NULL이면 최상위)
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. 좋아요 (중복 방지)
-- ============================================
CREATE TABLE likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type ENUM('post', 'comment') NOT NULL,
    target_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_user_target (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. 경기 예측
-- ============================================
CREATE TABLE match_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    prediction ENUM('home', 'draw', 'away') NOT NULL,  -- 야구는 draw 사용 안 함
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_match_user (match_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. API 사용량 추적
-- ============================================
CREATE TABLE api_usage_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_source VARCHAR(30) NOT NULL,           -- 'api_football', 'mlb_stats', 'kbo_crawl'
    endpoint VARCHAR(200) NOT NULL,
    request_date DATE NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    last_called_at DATETIME NOT NULL,
    UNIQUE KEY uk_source_date (api_source, request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Spring Boot 패키지 구조 & 주요 클래스

```
kr.smiling.sportshub/
├── SportsHubApplication.kt
│
├── config/
│   ├── SecurityConfig.kt          # Spring Security + CORS + JWT 필터
│   ├── RedisConfig.kt             # Redis 연결 + 캐시 설정
│   ├── CorsConfig.kt              # CORS 상세 설정
│   ├── WebConfig.kt               # Jackson, 인터셉터
│   └── SchedulerConfig.kt         # @EnableScheduling, 스레드풀
│
├── domain/
│   ├── user/
│   │   ├── User.kt                # @Entity
│   │   └── UserRepository.kt
│   ├── team/
│   │   ├── League.kt
│   │   ├── Team.kt
│   │   ├── LeagueRepository.kt
│   │   └── TeamRepository.kt
│   ├── match/
│   │   ├── Match.kt
│   │   ├── Standing.kt
│   │   ├── MatchRepository.kt
│   │   └── StandingRepository.kt
│   ├── community/
│   │   ├── Post.kt
│   │   ├── Comment.kt
│   │   ├── Like.kt
│   │   ├── MatchPrediction.kt
│   │   ├── PostRepository.kt
│   │   ├── CommentRepository.kt
│   │   ├── LikeRepository.kt
│   │   └── MatchPredictionRepository.kt
│   └── common/
│       ├── BaseEntity.kt           # createdAt, updatedAt
│       └── SportType.kt            # enum FOOTBALL, BASEBALL
│
├── controller/
│   ├── TeamController.kt          # /api/v1/teams/**
│   ├── MatchController.kt         # /api/v1/matches/**
│   ├── StandingController.kt      # /api/v1/leagues/**/standings
│   ├── FeedController.kt          # /api/v1/feed/**
│   ├── SubscriptionController.kt  # /api/v1/subscriptions/**
│   ├── PostController.kt          # /api/v1/posts/**
│   ├── CommentController.kt       # /api/v1/posts/**/comments
│   └── PredictionController.kt    # /api/v1/matches/**/prediction
│
├── service/
│   ├── TeamService.kt
│   ├── MatchService.kt
│   ├── StandingService.kt
│   ├── FeedService.kt
│   ├── SubscriptionService.kt
│   ├── PostService.kt
│   ├── CommentService.kt
│   ├── PredictionService.kt
│   └── CacheService.kt            # Redis 캐시 관리
│
├── dto/
│   ├── request/                    # 요청 DTO
│   └── response/                   # 응답 DTO
│
├── external/
│   ├── football/
│   │   ├── ApiFootballClient.kt    # WebClient 기반 API 호출
│   │   ├── ApiFootballMapper.kt    # 응답 → 도메인 변환
│   │   └── dto/                    # API-Football 응답 DTO
│   ├── mlb/
│   │   ├── MlbStatsClient.kt      # MLB Stats API 호출
│   │   ├── MlbStatsMapper.kt
│   │   └── dto/
│   └── kbo/
│       ├── KboCrawler.kt          # Jsoup 순위 크롤링
│       ├── KboScheduleClient.kt   # ASMX 일정/결과 호출
│       └── KboMapper.kt
│
├── scheduler/
│   ├── FootballDataScheduler.kt   # 축구 7개 리그 데이터 수집 (새벽 3시)
│   ├── MlbDataScheduler.kt       # MLB 데이터 수집 (새벽 3시)
│   ├── KboDataScheduler.kt       # KBO 크롤링 (새벽 3시)
│   ├── LiveScoreScheduler.kt     # 실시간 스코어 폴링 (경기 중)
│   └── ApiUsageTracker.kt        # API 사용량 추적
│
├── security/
│   ├── JwtTokenProvider.kt        # JWT 생성/검증
│   ├── JwtAuthFilter.kt          # OncePerRequestFilter
│   └── CustomUserDetails.kt
│
└── exception/
    ├── GlobalExceptionHandler.kt  # @RestControllerAdvice
    ├── BusinessException.kt
    └── ErrorCode.kt               # enum
```

---

## 4. API-Football 스케줄러 설계

### Cron 주기 & 갱신 대상

| 작업 | Cron (KST) | 대상 | 일일 req |
|------|-----------|------|---------|
| 순위 갱신 | `0 3 * * *` | 7개 리그 standings | 7 |
| 당일 일정 | `5 3 * * *` | 7개 리그 fixtures (date=today) | 7 |
| 전일 결과 | `10 3 * * *` | 7개 리그 fixtures (date=yesterday) | 7 |
| 팀 통계 | `30 3 * * *` | 로테이션 15팀/일 (~120팀 8일 순환) | 15 |
| 실시간 | `*/5 * * * *` | 경기 중인 fixture만 | 가변 |
| **합계** | | | **~36 + 가변** |

### 로직 흐름

```
FootballDataScheduler
├── collectStandings()      // 03:00 — 7개 리그 순위
│   ├── GET /standings?league={id}&season={year}
│   ├── 응답에서 description 필드 → zone_description 저장
│   └── Redis 캐시 갱신 (TTL 6h)
├── collectTodayFixtures()  // 03:05 — 오늘 경기 일정
│   ├── GET /fixtures?league={id}&date={today}
│   └── DB upsert + Redis 캐시 (TTL 1h)
├── collectYesterdayResults() // 03:10 — 전일 결과
│   ├── GET /fixtures?league={id}&date={yesterday}
│   └── status='finished' 업데이트
└── collectTeamStats()      // 03:30 — 팀 통계 로테이션
    ├── 오늘 수집 대상 팀 15개 선정 (라운드 로빈)
    ├── GET /teams/statistics?league={id}&team={teamId}&season={year}
    └── DB 저장 + Redis 캐시 (TTL 24h)
```

### Rate Limit 대응

```kotlin
// 요청 간 200ms 딜레이 + 일일 카운터
private suspend fun callWithRateLimit(block: suspend () -> T): T {
    apiUsageTracker.checkDailyLimit("api_football", 100)
    delay(200)
    return block().also { apiUsageTracker.increment("api_football") }
}
```

---

## 5. MLB 스케줄러 설계

| 작업 | Cron (KST) | 엔드포인트 |
|------|-----------|-----------|
| 순위 갱신 | `0 3 * * *` | `/standings?leagueId=103,104` (1 req) |
| 당일 일정 | `5 3 * * *` | `/schedule?sportId=1&date={today}` (1 req) |
| 전일 결과 | `10 3 * * *` | `/schedule?sportId=1&date={yesterday}` (1 req) |
| 박스스코어 | `15 3 * * *` | `/game/{gamePk}/boxscore` x 종료 경기 수 |
| 실시간 | `*/30s * * * *` | `/game/{gamePk}/linescore` (경기 중만) |

> MLB Stats API는 rate limit 없음 → 요청 예산 관리 불필요. 초당 1-2회 유지.

---

## 6. KBO 크롤러 설계

```
KboDataScheduler (03:20 KST)
├── KboCrawler.crawlStandings()
│   ├── Jsoup.connect("/Record/TeamRank/TeamRankDaily.aspx")
│   ├── .tData 테이블 파싱
│   └── DB standings 테이블 upsert
└── KboScheduleClient.fetchSchedule()
    ├── POST /ws/Schedule.asmx/GetScheduleList
    │   Content-Type: application/json
    │   Body: {"leId":"1","srId":"0,9","date":"20260506"}
    ├── JSON 응답 파싱
    └── DB matches 테이블 upsert

크롤링 간격: 최소 1시간 (부하 최소화)
User-Agent: 표준 브라우저 UA 설정
```

---

## 7. Next.js 페이지 & 컴포넌트 트리

```
app/
├── layout.tsx                      # 루트 레이아웃 (ThemeProvider, AdSense 스크립트)
├── (auth)/
│   ├── login/page.tsx              # 로그인 (카카오/구글 버튼)
│   └── onboarding/page.tsx         # 팀 선택 온보딩
├── (main)/
│   ├── layout.tsx                  # 메인 레이아웃 (GNB + 사이드바)
│   ├── page.tsx                    # 홈 피드 (대시보드)
│   ├── team/[code]/
│   │   ├── page.tsx                # 팀 상세 (탭 구조)
│   │   └── loading.tsx
│   ├── community/
│   │   ├── page.tsx                # 게시글 목록
│   │   ├── [postId]/page.tsx       # 게시글 상세
│   │   └── write/page.tsx          # 글 작성
│   └── mypage/page.tsx             # 마이페이지
└── api/auth/[...nextauth]/route.ts # NextAuth API Route

components/
├── layout/
│   ├── Header.tsx                  # GNB (로고, 검색, 테마 토글, 로그인)
│   ├── Sidebar.tsx                 # 구독 팀 리스트
│   └── Footer.tsx
├── onboarding/
│   ├── LeagueTabFilter.tsx         # 리그 탭 (전체/EPL/라리가/.../KBO/MLB/K리그)
│   ├── TeamCard.tsx                # 팀 선택 카드
│   └── SelectionPreview.tsx        # 하단 선택 미리보기 바
├── feed/
│   ├── StatCard.tsx                # 스탯 요약 카드 (경기수, 승률 등)
│   ├── MatchCard.tsx               # 경기 카드 (스코어, 상태 배지)
│   ├── LiveScoreBadge.tsx          # LIVE 깜빡임 배지
│   └── StandingMiniWidget.tsx      # 순위 미니 위젯
├── charts/                         # 모두 'use client' + dynamic import
│   ├── BarChart.tsx                # 최근 6경기 득/실점
│   ├── RadarChart.tsx              # 리그 내 순위 백분위
│   ├── LineChart.tsx               # 시즌 득/실점 추이
│   ├── DonutChart.tsx              # 포지션별 득점 분포
│   └── useChartTheme.ts           # light/dark 색상 훅
├── standings/
│   ├── StandingsTable.tsx          # 순위표 (존 컬러 바 포함)
│   ├── ZoneColorBar.tsx            # 좌측 4px 존 색상 바
│   ├── ZoneLegend.tsx              # 하단 범례 (챔스/유로파/강등)
│   └── zoneColors.ts              # description → 색상 매핑 상수
├── team/
│   ├── TeamHeader.tsx              # 폼 배지 + 시즌 스탯
│   ├── FormBadge.tsx               # W/D/L 컬러 도트
│   └── TeamTabs.tsx                # 탭 네비게이션
├── community/
│   ├── PostList.tsx                # 게시글 목록
│   ├── PostItem.tsx                # 게시글 카드
│   ├── CommentSection.tsx          # 댓글 + 대댓글
│   ├── PredictionVote.tsx          # 경기 예측 투표
│   └── CategoryFilter.tsx          # 자유/리뷰/이적 필터
├── ad/
│   └── AdUnit.tsx                  # AdSense 광고 컴포넌트 (use client)
└── common/
    ├── ThemeToggle.tsx             # 해/달 아이콘 토글
    ├── SportIcon.tsx               # 축구/야구 아이콘 구분
    └── LoadingSkeleton.tsx

lib/
├── api.ts                          # fetch 래퍼 (Bearer 토큰 자동 첨부)
├── store.ts                        # Zustand (구독팀, 테마, 필터)
├── auth.ts                         # NextAuth 설정 (카카오/구글)
└── constants.ts                    # 리그 코드, 존 색상 등
```

---

## 8. 인증 플로우 (시퀀스)

```
[사용자] → [Next.js] → [OAuth Provider] → [Next.js] → [Spring Boot]

1. 사용자가 "카카오로 로그인" 클릭
2. Next.js → 카카오 OAuth 인증 페이지로 리다이렉트
3. 사용자가 카카오에서 인증 완료
4. 카카오 → /api/auth/callback/kakao 로 authorization code 전달
5. NextAuth가 code → access_token 교환
6. NextAuth jwt callback:
   - 첫 로그인: Spring Boot POST /api/v1/auth/login 호출
     (provider, providerId, email, nickname 전달)
   - Spring Boot: users 테이블에 upsert → userId 반환
   - JWT에 userId, email, accessToken 저장
7. 이후 API 호출:
   - Client Component: fetch('/api/v1/...') → rewrites로 프록시
   - 헤더: Authorization: Bearer {JWT}
8. Spring Boot JwtAuthFilter:
   - JWT 검증 (AUTH_SECRET으로 서명 확인)
   - SecurityContext에 인증 정보 설정
```

---

## 9. AdSense 적용 위치 & 방법

| 위치 | 광고 형식 | 컴포넌트 | 페이지 |
|------|----------|---------|--------|
| 홈 피드 하단 | Display (반응형) | `<AdUnit slot="home-bottom" />` | `/(main)/page.tsx` |
| 팀 상세 사이드 | Display (sticky) | `<AdUnit slot="team-side" />` | `/team/[code]/page.tsx` |
| 커뮤니티 인피드 | In-feed | `<AdUnit slot="community-feed" />` | 게시글 5개마다 삽입 |

**구현:**
- `layout.tsx`에서 `<Script strategy="lazyOnload">` 로 AdSense 1회 로드
- `AdUnit.tsx`는 `'use client'` + `useEffect`에서 `adsbygoogle.push({})`
- `min-height` 예약으로 CLS 방지
- 프로덕션 환경에서만 렌더링

---

## 10. MVP 범위 확정

### MVP 포함

| 기능 | 상세 |
|------|------|
| 팀 구독 | 온보딩 팀 선택, 비로그인 LocalStorage, 마이페이지 변경 |
| 홈 피드 | 오늘 경기 + 최근 결과 + 순위 미니위젯 + 차트 2개(막대/레이더) |
| 팀 상세 | 4탭 (일정/순위/스탯/커뮤니티) |
| 순위표 | 존 구분 (챔스/유로파/컨퍼런스/강등 색상 바 + 범례) |
| 커뮤니티 | 게시판 CRUD + 댓글/대댓글 + 좋아요 |
| 인증 | 카카오/구글 OAuth (JWT) |
| 데이터 수집 | API-Football + MLB Stats API + KBO 크롤링 |
| 테마 | 라이트/다크 토글 |
| 광고 | AdSense 배너 3곳 |

### MVP 제외 → MVP 완료로 이동

| 기능 | 상태 |
|------|------|
| ~~경기 예측 투표~~ | 제외 (유사 서비스 존재) |
| ~~팬 레벨 시스템~~ | 백그라운드 적립 구현 완료 (UI 비활성) |
| ~~푸시 알림~~ | Web Push + Service Worker 구현 완료 |
| ~~선수 상세 프로필~~ | 제외 |
| 경기 하이라이트 영상 | 저작권 이슈로 보류 |
| 다국어 지원 | 국내 타겟 우선 |

---

## 11-1. Phase 4 로드맵 (포인트 활용)

> 포인트 적립은 백그라운드로 이미 동작 중 (게시글 +5P, 댓글 +2P, 좋아요 +1P)
> users.totalPoints, users.fanLevel 자동 갱신됨
> 아래 기능은 활성 유저 확보 후 순차 적용

### 4-1. 프로필 뱃지/칭호 시스템

| 항목 | 내용 |
|------|------|
| 설명 | 팬 레벨에 따라 닉네임 옆에 뱃지 표시 (루키→일반→열성→골수→레전드) |
| 구현 위치 | 커뮤니티 게시글/댓글 작성자 영역, 마이페이지 |
| 난이도 | 하 (프론트 UI만 추가) |
| 우선순위 | 1순위 |

### 4-2. 커뮤니티 특권

| 레벨 | 특권 |
|------|------|
| Lv.1 | 기본 글/댓글 작성 |
| Lv.2 | 게시글 이미지 첨부 (최대 5장) |
| Lv.3 | 게시글 고정 요청 가능 |
| Lv.4+ | 커뮤니티 모더레이터 신청 자격 |

| 항목 | 내용 |
|------|------|
| 구현 위치 | PostService.createPost()에 레벨 체크 추가 |
| 난이도 | 하 |
| 우선순위 | 2순위 |

### 4-3. 팀별 팬 랭킹

| 항목 | 내용 |
|------|------|
| 설명 | 주간/월간 활동 포인트 기준 팀별 TOP 10 랭킹 |
| 표시 위치 | 커뮤니티 사이드바, 팀 상세 페이지 |
| 구현 | fan_activities 테이블에서 기간별 SUM 쿼리 |
| 난이도 | 중 (쿼리 + 캐싱) |
| 우선순위 | 2순위 |

### 4-4. 커스텀 이모지/리액션

| 항목 | 내용 |
|------|------|
| 설명 | Lv.3+ 전용 이모지 리액션 (축구공, 홈런 등) |
| 구현 | 댓글/게시글에 리액션 타입 추가, 레벨 체크 |
| 난이도 | 중 |
| 우선순위 | 3순위 |

---

## 11. 리스크 & 트레이드오프

| 리스크 | 심각도 | 결정 | 근거 |
|--------|--------|------|------|
| API-Football 100 req/day (7개 리그) | **상** | Pro 플랜 $19/월 전환 | 무료로는 팀 통계 로테이션 불가. 서버비 대비 저렴 |
| KBO `/ws/` 크롤링 정책 | 중 | ASMX 직접 호출 채택 | 크롤링 간격 1h+, UA 설정, 부하 최소화. 추후 상용 API 전환 대비 인터페이스 분리 |
| MLB 상업적 사용 | 중 | AdSense 수익 미미하므로 비상업적 범주 유지 | 대규모 수익화 시 재검토 |
| JWT 토큰 무효화 불가 | 하 | 만료 시간 짧게 (1h) + refresh token 패턴 | 강제 로그아웃 필요 시 블랙리스트 Redis 추가 |
| Redis 메모리 (4GB 서버) | 중 | maxmemory 1GB + allkeys-lru | ~160팀 데이터 크기 추정 ~200MB 이내 |
| Chart.js SSR 불가 | 하 | dynamic import + ssr: false | 차트 영역 스켈레톤 UI로 대체 |
| 실시간 스코어 정확도 | 중 | 축구 5분 / 야구 30초 폴링 | WebSocket 없으므로 폴링이 유일한 방법 |

---

## 12. 구현 순서 (Phase 3 로드맵)

```
Phase 3-1: 백엔드 기반 (1~2주)
  ① Spring Boot 프로젝트 생성 (Kotlin + JPA + QueryDSL + Redis)
  ② Flyway 마이그레이션 (위 DDL 전체)
  ③ 팀/리그 마스터 데이터 seed
  ④ API-Football 연동 + 스케줄러
  ⑤ MLB Stats API 연동 + 스케줄러
  ⑥ KBO 크롤러

Phase 3-2: 백엔드 API (2~3주)
  ⑦ 팀/경기/순위 조회 API
  ⑧ JWT 인증 필터 (NextAuth 연동)
  ⑨ 구독/피드 API
  ⑩ 커뮤니티 CRUD API

Phase 3-3: 프론트엔드 (3~4주)
  ⑪ Next.js 프로젝트 + NextAuth (카카오/구글)
  ⑫ 온보딩 페이지
  ⑬ 홈 피드 + 차트
  ⑭ 팀 상세 (4탭) + 순위표 존 구분
  ⑮ 커뮤니티 게시판

Phase 3-4: 마무리 (1주)
  ⑯ 라이트/다크 테마 토글
  ⑰ AdSense 배너 적용
  ⑱ 마이페이지
  ⑲ 모바일 반응형
```

---

*승인 후 Phase 3 구현을 시작합니다. 코드 작성은 승인 전까지 하지 않습니다.*
