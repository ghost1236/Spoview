# 마이팀 스포츠 허브 — Phase 1 Research

> 작성일: 2026-05-04 | 수정일: 2026-05-06
> 커버 리그: 축구 7개(유럽 5대 + K리그1/2) + 야구 2개(KBO + MLB)

---

## 1. API-Football v3 분석

### 1-1. 무료 플랜 제한

| 항목 | 내용 |
|------|------|
| 일일 요청 | 100 req/day (00:00 UTC 리셋) |
| 분당 제한 | ~10 req/min (응답 헤더로 확인) |
| 접근 범위 | 모든 엔드포인트 사용 가능 |
| 초과 시 | 429 Too Many Requests 반환 |
| 유료 대안 | Pro $19/월 (7,500 req/day) |

**모니터링 헤더:**
- `X-RateLimit-Limit`: 분당 최대
- `X-RateLimit-Remaining`: 분당 잔여

### 1-2. 리그 ID 목록

| 리그 | League ID | 비고 |
|------|-----------|------|
| EPL (Premier League) | 39 | 확인됨 |
| La Liga | 140 | 확인됨 |
| Bundesliga | 78 | 확인됨 |
| Serie A | 135 | 확인됨 |
| Ligue 1 | 61 | 확인됨 |
| K-League 1 | 292 | API로 최종 검증 필요 |
| K-League 2 | 293 | API로 최종 검증 필요 |

> K-League ID는 프로젝트 시작 시 `/leagues?country=South Korea` 호출로 확인 (1회 소모)

### 1-3. 주요 엔드포인트 응답 스키마

#### Fixtures (경기 일정/결과)

**엔드포인트:** `GET /fixtures?league={id}&season={year}&date={YYYY-MM-DD}`

**파라미터:**
- `league`, `season` (필수)
- `date`, `from`/`to` (날짜 범위), `timezone`, `status`

**응답 구조:**
```json
{
  "response": [{
    "fixture": {
      "id": 12345,
      "date": "2025-09-15T15:00:00+00:00",
      "status": { "long": "Match Finished", "short": "FT", "elapsed": 90 }
    },
    "league": { "id": 39, "name": "Premier League", "season": 2025, "round": "Regular Season - 5" },
    "teams": {
      "home": { "id": 1, "name": "팀명", "logo": "url", "winner": true },
      "away": { "id": 2, "name": "팀명", "logo": "url", "winner": false }
    },
    "goals": { "home": 2, "away": 1 },
    "score": {
      "halftime": { "home": 1, "away": 0 },
      "fulltime": { "home": 2, "away": 1 }
    }
  }]
}
```

> 페이지네이션 존재: `paging.total > 1`이면 추가 요청 필요

#### Standings (리그 순위)

**엔드포인트:** `GET /standings?league={id}&season={year}`

**응답 구조:**
```json
{
  "response": [{
    "league": {
      "standings": [[{
        "rank": 1,
        "team": { "id": 1, "name": "팀명", "logo": "url" },
        "points": 45,
        "goalsDiff": 25,
        "form": "WWDWW",
        "description": "Champions League",
        "all": { "played": 20, "win": 14, "draw": 3, "lose": 3, "goals": { "for": 40, "against": 15 } },
        "home": { "played": 10, "win": 8, ... },
        "away": { "played": 10, "win": 6, ... }
      }]]
    }
  }]
}
```

> **`description` 필드**가 해당 순위의 존(zone)을 나타냄 — 챔스/유로파/강등 등 UI 색상 매핑에 활용

#### 순위표 존(Zone) 구분 — 리그별 상세

**API-Football `description` 필드 매핑:**

| description 값 | 존 구분 | UI 색상 | 좌측 바 |
|---------------|---------|---------|---------|
| `Champions League` | 챔피언스리그 진출 | 파랑 `#1E40AF` | 파랑 4px |
| `Champions League Qualifiers` | 챔스 예선 | 파랑(연) `#3B82F6` | 파랑(연) 4px |
| `Europa League` | 유로파리그 진출 | 주황 `#EA580C` | 주황 4px |
| `Europa Conference League` | 컨퍼런스리그 진출 | 초록 `#16A34A` | 초록 4px |
| `Europa Conference League Qualifiers` | 컨퍼런스리그 예선 | 초록(연) `#4ADE80` | 초록(연) 4px |
| `Relegation` | 강등 | 빨강 `#DC2626` | 빨강 4px |
| `Relegation Playoff` | 강등 플레이오프 | 빨강(연) `#F87171` | 빨강(연) 4px |
| `Promotion` | 승격 (K리그2) | 보라 `#7C3AED` | 보라 4px |
| `null` / 없음 | 일반 | 없음 | 없음 |

**리그별 존 배분 (2025-26 기준):**

| 리그 | 챔스 | 유로파 | 컨퍼런스 | 강등 |
|------|------|--------|---------|------|
| EPL (20팀) | 1~4위 | 5위 | 6위 | 18~20위 |
| 라리가 (20팀) | 1~4위 | 5위 | 6위 | 18~20위 |
| 분데스리가 (18팀) | 1~4위 | 5위 | 6위 | 16위(PO), 17~18위 |
| 세리에A (20팀) | 1~4위 | 5위 | 6위 | 18~20위 |
| 리그앙 (18팀) | 1~3위 | 4위 | 5위 | 16위(PO), 17~18위 |
| K리그1 (12팀) | — | ACL 1~3위 | — | 11~12위 |

> 각 시즌 컵대회 결과 등에 따라 슬롯이 유동적일 수 있으나, API-Football의 `description` 필드가 자동으로 최신 존 정보를 반영하므로 하드코딩하지 않고 API 응답 기반으로 렌더링.

**UI 구현 방식:**
1. **좌측 컬러 바**: 순위 행 왼쪽에 4px 세로 바 (존 색상)
2. **라벨 배지**: 순위표 하단에 범례 표시 (색상 + 존 이름)
3. **내 팀 하이라이트**: 구독 팀 행은 배경색 강조 (존 색상과 별개)
4. **다크모드**: 동일 색상 계열, 명도만 조절 (밝은 톤)

#### Teams Statistics (팀 통계)

**엔드포인트:** `GET /teams/statistics?league={id}&team={teamId}&season={year}`

- 시즌 전체 누적 통계 (승/무/패, 득실점, 클린시트 등)
- `date` 파라미터로 특정 날짜까지의 누적 통계 가능

### 1-4. 스케줄러 설계 (새벽 3시 KST 배치 수집)

#### 일일 요청 예산 배분

| 용도 | 요청 수 | 설명 |
|------|---------|------|
| Standings (순위) | 7 | 리그당 1회 x 7개 리그 |
| Fixtures 당일 일정 | 7 | 리그당 1회 x 7개 리그 |
| Fixtures 전일 결과 | 7 | 리그당 1회 x 7개 리그 |
| 팀 통계 로테이션 | 10~15 | 매일 다른 팀 순환 |
| 예비 | 64~69 | 긴급 조회, 추가 데이터 |
| **합계** | **100** | |

> **7개 리그 운영 시 100 req/day가 빠듯함.** 팀 통계 로테이션까지 고려하면 Pro 플랜($19/월, 7,500 req/day) 전환 권장. 무료로 운영 시 팀 통계 수집 주기를 주 1회로 낮춰야 함.

#### 최적화 전략

1. **날짜 범위 조회**: `from`/`to`로 1주일치 한 번에 확보 (리그당 1 req)
2. **시즌 초 전체 일정 수집**: 시즌 시작 시 리그별 1 req로 전 일정 확보 → DB 저장
3. **팀 통계 로테이션**: 90팀 ÷ 매일 15팀 = 6일 주기 전체 순환
4. **경기 없는 날 스킵**: 순위 변동 없으므로 Standings 생략
5. **요청 간 간격**: 100~200ms (분당 제한 회피)
6. **실패 재시도**: 지수 백오프 (1s → 2s → 4s)
7. **일일 카운터**: DB에 사용량 기록하여 100회 초과 방지

#### Cron 스케줄

| 작업 | Cron | 설명 |
|------|------|------|
| 순위 + 일정 + 결과 | `0 3 * * *` | 매일 새벽 3시 |
| 팀 통계 로테이션 | `30 3 * * *` | 순위 수집 후 30분 뒤 |
| 실시간 스코어 (경기 중) | `*/5 * * * *` | 5분 간격 (경기일에만) |

---

## 2. KBO 크롤링 분석

### 2-1. robots.txt 분석

```
User-agent: *
Disallow: /Common/
Disallow: /Help/
Disallow: /Member/
Disallow: /ws/
```

- `/Schedule/`, `/Record/` 등 데이터 페이지: **차단 안 됨**
- `/ws/` (AJAX 웹서비스): **차단됨** ← 핵심 데이터 엔드포인트

### 2-2. 페이지별 렌더링 방식

| 페이지 | URL | 렌더링 | Jsoup 가능 |
|--------|-----|--------|-----------|
| 팀 순위 | `/Record/TeamRank/TeamRankDaily.aspx` | SSR | **가능** |
| 경기 일정 | `/Schedule/Schedule.aspx` | AJAX 동적 | **불가** |
| 경기 결과 | `/Schedule/GameCenter/Main.aspx` | AJAX 동적 | **불가** |

### 2-3. 기술 분석

**팀 순위 (Jsoup 가능):**
- 테이블 클래스: `.tData`
- 표준 `<table>/<th>/<td>` 구조
- 컬럼: 순위, 팀명, 경기, 승, 패, 무, 승률, 게임차, 최근10경기, 연속, 홈, 방문

**경기 일정/결과 (동적 로딩):**
- AJAX 엔드포인트: `/ws/Schedule.asmx/GetScheduleList` (POST, JSON)
- 파라미터: `{leId, srId, date}`
- HTML에는 빈 컨테이너만 존재 (`#boxList`, `#boxCal`)

### 2-4. 구현 방안

#### 권장: 하이브리드 접근

| 데이터 | 방법 | 비고 |
|--------|------|------|
| 팀 순위 | Jsoup HTML 파싱 | `.tData` 테이블 직접 파싱 |
| 경기 일정/결과 | ASMX 직접 POST 호출 | JSON 응답, 파싱 용이 |

**ASMX 직접 호출 주의사항:**
- robots.txt에서 `/ws/` 차단 → 정책적 비권장
- 상업적 용도시 공식 채널 확인 필요
- 대안: Selenium/Playwright (느리지만 합법적)

### 2-5. 대안 데이터 소스

| 소스 | URL | 특징 |
|------|-----|------|
| Statiz | statiz.co.kr | 세이버메트릭스, SSR 가능성 높음 |
| KBReport | kbreport.com | KBO 통계 전문 |
| 네이버 스포츠 | sports.naver.com/kbaseball | SPA 구조 |
| LSports API | lsports.eu | 상용 글로벌 KBO 데이터 |

### 2-6. 결론

- Jsoup 단독으로는 순위만 가능
- 일정/결과는 ASMX 직접 호출이 가장 효율적 (기술적 가능, 정책적 회색지대)
- MVP에서는 ASMX 직접 호출 + 적절한 크롤링 간격(1시간+)으로 부하 최소화
- 향후 공식 데이터 파트너십이나 상용 API 전환 고려

---

## 3. MLB Stats API 분석

### 3-1. 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL | `https://statsapi.mlb.com/api/v1/` |
| 인증 | **불필요** (API 키, 등록 없이 GET 요청) |
| 비용 | 비상업적 용도 **완전 무료** |
| Rate Limit | 공식 명시 없음 (초당 1-2회 권장) |
| 상업적 사용 | MLB Advanced Media 사전 허가 필요 |

### 3-2. 주요 엔드포인트

#### Schedule (일정/결과)

```
GET /api/v1/schedule?sportId=1&date=2026-05-04
GET /api/v1/schedule?sportId=1&startDate=2026-05-01&endDate=2026-05-31
```

**응답 구조:**
```json
{
  "dates": [{
    "date": "2026-05-04",
    "games": [{
      "gamePk": 747175,
      "gameDate": "2026-05-04T23:05:00Z",
      "status": {
        "abstractGameState": "Live",
        "detailedState": "In Progress",
        "statusCode": "I"
      },
      "teams": {
        "away": { "team": { "id": 147, "name": "New York Yankees" }, "score": 3 },
        "home": { "team": { "id": 111, "name": "Boston Red Sox" }, "score": 5 }
      },
      "venue": { "id": 3, "name": "Fenway Park" }
    }]
  }]
}
```

#### Standings (순위)

```
GET /api/v1/standings?leagueId=103,104&season=2026
```

- `leagueId`: 103(AL), 104(NL)

**응답 구조:**
```json
{
  "records": [{
    "division": { "id": 201, "name": "American League East" },
    "teamRecords": [{
      "team": { "id": 147, "name": "New York Yankees" },
      "wins": 25, "losses": 12,
      "winningPercentage": ".676",
      "gamesBack": "-",
      "streak": { "streakCode": "W3" },
      "runsScored": 180, "runsAllowed": 120
    }]
  }]
}
```

#### Live Game Feed (실시간)

```
GET /api/v1.1/game/{gamePk}/feed/live    # 전체 실시간 데이터
GET /api/v1/game/{gamePk}/linescore      # 이닝별 요약 (가벼움)
GET /api/v1/game/{gamePk}/boxscore       # 박스스코어
```

#### 기타

```
GET /api/v1/teams?sportId=1              # 전체 30개 팀
GET /api/v1/teams/{teamId}/roster        # 로스터
GET /api/v1/people/{id}/stats            # 선수 통계
```

### 3-3. 시즌 일정

| 기간 | 내용 |
|------|------|
| 2월 중순~3월 | 스프링 트레이닝 |
| 3월 말~4월 초 | 정규시즌 개막 |
| 4월~9월 | 정규시즌 (각 팀 162경기) |
| 7월 중순 | 올스타 브레이크 (~4일) |
| 10월 | 포스트시즌 |
| 10월 말~11월 초 | 월드시리즈 |

- 일일 경기 수: 12~16경기/일
- 경기 시간: 미국 동부 오후 1~7시 (한국 새벽 2~8시)

### 3-4. 수집 전략

| 작업 | 방법 | 주기 |
|------|------|------|
| 일정 + 결과 | `/schedule` 날짜 범위 조회 | 매일 새벽 3시 배치 |
| 순위 | `/standings` | 매일 새벽 3시 배치 |
| 박스스코어 | `/game/{gamePk}/boxscore` | 경기 종료 후 수집 |
| 실시간 스코어 | `/game/{gamePk}/linescore` 폴링 | 경기 중 30초 간격 |

**API-Football과 다른 점:** Rate limit이 사실상 없으므로 요청 예산 관리 부담 없음. 단, 예의상 초당 1-2회 유지.

### 3-5. 대안 데이터 소스

| 소스 | 특징 | 비용 |
|------|------|------|
| ESPN Hidden API | 빠른 스코어 확인, 비공식 | 무료 |
| SportsDataIO | 지난 시즌 데이터 Discovery Lab | 무료/유료 |
| Sportradar | MLB 공식 파트너, 가장 신뢰 | 유료 |

**권장:** MLB Stats API 메인 + ESPN API 보조 (스코어보드 한 번에 확인)

---

## 4. NCP VPC 서버 환경

### 3-1. 서버 구성

| 항목 | 스펙 |
|------|------|
| OS | Ubuntu 22.04 LTS |
| Java | OpenJDK 21 (Temurin/Corretto) |
| Web Server | Nginx (reverse proxy) |
| DB | MariaDB 10.11+ |
| Cache | Redis 7.x |
| ACG(방화벽) | 80/443 외부, 3306/6379/8090 내부만 |

### 3-2. Spring Boot JAR 배포

**포트:** 8090 (내장 톰캣, 별도 설치 불필요)

**application-prod.yml 필수 항목:**

| 카테고리 | 설정 |
|---------|------|
| DB | `spring.datasource.url`, `hikari.maximum-pool-size(10-20)`, `hibernate.ddl-auto=validate` |
| Redis | `spring.data.redis.host/port/password`, `lettuce.pool.*` |
| Server | `server.port=8090`, `server.shutdown=graceful` |
| Scheduler | `@EnableScheduling`, `spring.task.scheduling.pool.size=3` |
| Logging | `logging.file.name=/var/log/app/sportshub.log`, rolling policy |

> Spring Boot 3에서 `spring.redis.*` → `spring.data.redis.*`로 변경됨

### 3-3. 프로세스 관리: systemd 권장

| 비교 | systemd | restart.sh |
|------|---------|-----------|
| 자동 시작 | O (WantedBy=multi-user.target) | X |
| 크래시 복구 | Restart=on-failure | 별도 감시 필요 |
| 로그 관리 | journalctl 통합 | 수동 |
| 배포 연동 | `systemctl restart` 통일 | 경로 관리 부담 |

**서비스 파일 핵심:**
- `Type=simple`
- `User=sportshub` (비root 전용 계정)
- `ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod -Xms512m -Xmx1024m /opt/sportshub/app.jar`
- `Restart=on-failure`, `RestartSec=10`
- `EnvironmentFile=/opt/sportshub/.env`

### 3-4. Nginx 설정

- upstream: `127.0.0.1:8090`
- 헤더: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`
- Timeout: `proxy_connect_timeout 60s`, `proxy_read_timeout 90s`
- SSL: Certbot (Let's Encrypt)
- gzip: `application/json text/css application/javascript`
- `client_max_body_size 10M`

---

## 5. NextAuth.js 설정

### 4-1. 카카오 OAuth

| 항목 | 내용 |
|------|------|
| Console | developers.kakao.com |
| 필수 설정 | 카카오 로그인 활성화, 동의항목, 웹 플랫폼 등록 |
| 환경변수 | `AUTH_KAKAO_ID` (REST API 키), `AUTH_KAKAO_SECRET` |
| Callback | `https://{DOMAIN}/api/auth/callback/kakao` |

### 4-2. 구글 OAuth

| 항목 | 내용 |
|------|------|
| Console | Google Cloud Console |
| 환경변수 | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Callback | `https://{DOMAIN}/api/auth/callback/google` |

### 4-3. JWT vs DB Session 선택

**이 프로젝트에서 JWT Session 권장:**

| 근거 | 설명 |
|------|------|
| 아키텍처 적합성 | Next.js↔Spring Boot 분리 구조에서 stateless JWT가 자연스러움 |
| 복잡도 | DB session은 양 서버가 세션 DB를 공유해야 함 |
| 확장성 | JWT는 별도 세션 저장소 불필요 |
| 토큰 전달 | Bearer 토큰으로 Spring Boot에 전달 용이 |

**Spring Boot 연동 패턴:**
1. NextAuth `jwt` callback → OAuth access_token 저장
2. `session` callback → 세션에 accessToken 노출
3. API 호출 시 `Authorization: Bearer {token}` 헤더
4. Spring Boot에서 JWT 검증

### 4-4. Vercel 환경변수

| 변수 | 설명 |
|------|------|
| `AUTH_SECRET` | 토큰 암호화 키 (`openssl rand -base64 32`) |
| `AUTH_KAKAO_ID` | 카카오 REST API 키 |
| `AUTH_KAKAO_SECRET` | 카카오 Client Secret |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `NEXT_PUBLIC_API_URL` | `https://api.smiling.kr` |

> Vercel에서 `NEXTAUTH_URL`은 자동 감지되므로 설정 불필요

---

## 6. Next.js 14 + Spring Boot 연동

### 5-1. CORS 설정 (Spring Boot SecurityConfig)

**허용 Origin:**
- `https://smiling.kr`
- `https://*.vercel.app` (Preview 배포)
- `http://localhost:3000` (개발)

**설정 항목:**
- `allowedMethods`: GET, POST, PUT, DELETE, OPTIONS
- `allowedHeaders`: Authorization, Content-Type, X-Requested-With
- `allowCredentials`: true
- `maxAge`: 3600 (pre-flight 캐시 1시간)

> `allowedOrigins("*")` + `allowCredentials(true)` 동시 불가 → `allowedOriginPatterns` 사용

### 5-2. next.config.js rewrites

```js
// next.config.js
rewrites: async () => [{
  source: '/api/:path*',
  destination: 'https://api.smiling.kr/api/:path*'
}]
```

**전략:** rewrites(클라이언트 프록시) + Spring Boot CORS(직접 호출 대비) 이중 설정

| 호출 방식 | 권장 |
|-----------|------|
| Server Component → API | rewrites 불필요 (서버→서버) |
| Client Component → API | rewrites 사용 |
| 외부 웹훅 → API | CORS 필수 |

### 5-3. Chart.js 연동

**라이브러리 선택: react-chartjs-2 권장**

| 비교 | react-chartjs-2 | Recharts |
|------|-----------------|----------|
| 렌더링 | Canvas | SVG |
| 대규모 데이터 | 우수 | 느림 |
| SSR | 불가 (dynamic import) | 가능 |
| 다크모드 | options 동적 교체 | props 전달 (쉬움) |

**스포츠 통계 대시보드 특성상 데이터 포인트 많음 → Canvas 기반 react-chartjs-2 적합**

**다크모드 전환 구현:**
1. `next-themes`로 테마 상태 관리
2. `chartTheme.ts`에 light/dark 색상 팔레트 정의
3. `useChartTheme()` 커스텀 훅으로 현재 팔레트 반환
4. 테마 변경 시 Chart options 색상 교체 → `chart.update()`
5. Next.js에서 `dynamic(() => import(...), { ssr: false })` 필수

---

## 7. Google AdSense 적용

### 6-1. 스크립트 삽입 (layout.tsx)

- `next/script`의 `Script` 컴포넌트 사용
- `strategy="afterInteractive"` 또는 `"lazyOnload"`
- `crossOrigin="anonymous"`
- 프로덕션 전용: `process.env.NODE_ENV === 'production'` 조건부 렌더링
- `public/ads.txt` 배치 필수

### 6-2. 광고 배치 위치

| 위치 | 광고 형식 | 구현 |
|------|----------|------|
| 홈 피드 하단 | Display Ad (반응형) | 피드 리스트 하단 AdUnit 컴포넌트 |
| 팀 상세 사이드바 | Display Ad | sticky 포지션 |
| 커뮤니티 게시글 사이 | In-feed Ad | N개마다 광고 삽입 |

**Manual Units 권장** (Auto Ads는 레이아웃 제어 어려움)

### 6-3. SSR/Hydration 충돌 해결

| 문제 | 해결 |
|------|------|
| hydration mismatch | `"use client"` + Client Component로 분리 |
| 서버/클라이언트 불일치 | `useEffect`에서만 `adsbygoogle.push()` 실행 |
| SPA 라우트 전환 | key prop으로 리마운트 유도 |
| 초기 렌더 차이 | `useState` 마운트 감지 후 조건부 렌더링 |

### 6-4. 퍼포먼스 Best Practices

1. `strategy="lazyOnload"` → 콘텐츠 우선 로드
2. Intersection Observer → 뷰포트 진입 시만 로드
3. 광고 슬롯 고정 크기 예약 → CLS 방지 (`min-height`)
4. 프로덕션 환경에서만 로드
5. layout.tsx에서 스크립트 1회만 로드, 개별은 push()만

---

## 8. 리스크 & 주의사항 종합

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| API-Football 100 req/day 부족 (7개 리그) | **상** | Pro 플랜 $19/월 전환 강력 권장. 무료 시 팀 통계 주 1회로 제한 |
| KBO 크롤링 법적 리스크 | 중 | 크롤링 간격 1시간+, 부하 최소화, 상용 API 대안 검토 |
| MLB Stats API 상업적 사용 제한 | 중 | 비상업적 용도 무료. 수익화 시 MLB Advanced Media 허가 필요 |
| K-League ID 미확인 | 하 | 프로젝트 초기에 API 1회 호출로 검증 |
| Chart.js SSR 비호환 | 하 | dynamic import로 해결 |
| AdSense 승인 기간 | 중 | 콘텐츠 충분히 확보 후 신청 (최소 10~20 페이지) |
| Redis 메모리 부족 (4GB 서버) | 중 | maxmemory 1GB 제한 + LRU 정책 |
| 팀 수 증가 (~160팀) | 하 | DB 인덱싱 + Redis 캐싱으로 성능 확보 |

---

## 9. 캐싱 전략 정리

| 데이터 | TTL | 저장소 | 비고 |
|--------|-----|--------|------|
| 경기 결과 (종료) | 영구 | DB | 축구 + 야구 공통 |
| 리그 순위 (축구) | 6시간 | Redis | API-Football |
| 리그 순위 (MLB) | 6시간 | Redis | MLB Stats API |
| KBO 순위 | 6시간 | Redis | 크롤링 |
| 오늘 경기 일정 | 1시간 | Redis | 전 리그 공통 |
| 실시간 스코어 (축구) | 5분 | Redis | 경기 중만 |
| 실시간 스코어 (야구) | 30초 | Redis | 경기 중만, MLB API 부담 적음 |
| 팀 통계 | 24시간 | Redis | |
| 팀 마스터 데이터 | 시즌 단위 | DB | ~160팀 |

---

*Phase 2 Planning에서 이 분석을 기반으로 구체적인 설계 문서를 작성합니다.*
