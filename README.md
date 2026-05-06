# Spoview — 내 팀만 골라서, 한눈에

KBO · MLB · K리그 · EPL · 라리가 · 분데스리가 · 세리에A · 리그앙  
내가 좋아하는 팀을 골라 경기 일정, 순위, 스탯을 한 화면에서 확인하는 스포츠 팬 허브 서비스

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (상태관리)
- NextAuth.js (카카오/구글 OAuth)
- Chart.js + react-chartjs-2

### Backend
- Spring Boot 3.4 (Kotlin)
- JPA + QueryDSL
- MariaDB
- Redis
- Flyway (마이그레이션)

### 데이터 소스
| 소스 | 대상 | 비용 |
|------|------|------|
| football-data.org | 유럽 5대 리그 순위/경기 | 무료 |
| kleague.com API | K리그1/K리그2 순위/경기 | 무료 |
| koreabaseball.com | KBO 순위/경기 | 무료 |
| MLB Stats API | MLB 순위/경기 | 무료 |

## 주요 기능

- **팀 구독** — 9개 리그에서 관심 팀 선택
- **홈 대시보드** — 내 팀 현황, 다가오는 경기, 오늘 경기, 리그 순위
- **데이터 시각화** — 막대/레이더/라인/도넛 차트
- **팀 정보** — 경기 일정, 리그 순위(존 구분), 팀 스탯
- **커뮤니티** — 팀별 게시판, 댓글, 좋아요, 이미지 첨부
- **순위표 존 구분** — 챔스/유로파/컨퍼런스/강등 컬러바
- **팬 레벨** — 활동 기반 포인트 시스템
- **다크모드** — 라이트/다크 테마 토글
- **소셜 로그인** — 카카오/구글 OAuth

## 프로젝트 구조

```
SportsHub/
├── backend/                    # Spring Boot (Kotlin)
│   └── src/main/kotlin/
│       ├── controller/         # REST API
│       ├── service/            # 비즈니스 로직
│       ├── domain/             # JPA 엔티티
│       ├── external/           # 외부 API 클라이언트
│       ├── scheduler/          # 데이터 수집 스케줄러
│       ├── security/           # JWT 인증
│       └── config/             # 설정
├── frontend/                   # Next.js 14
│   └── src/
│       ├── app/                # 페이지 (App Router)
│       ├── components/         # UI 컴포넌트
│       └── lib/                # API, Store, 상수
├── research.md                 # Phase 1 리서치
├── plan.md                     # Phase 2 설계
└── sports-hub-final.md         # 요구사항 문서
```

## 실행 방법

### 사전 준비
- Java 17+
- Node.js 18+
- MariaDB
- Redis

### Backend
```bash
cd backend

# DB 생성
mysql -u root -e "CREATE DATABASE sports_hub CHARACTER SET utf8mb4;"

# 실행 (Flyway가 자동 마이그레이션)
./gradlew bootRun
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
# .env.local에 API 키 입력

npm install
npm run dev
```

### 데이터 수집 (개발용)
```bash
# 전체 수집
curl -X POST http://localhost:8090/api/v1/admin/collect/all

# 개별 수집
curl -X POST http://localhost:8090/api/v1/admin/collect/football-standings
curl -X POST http://localhost:8090/api/v1/admin/collect/kleague
curl -X POST http://localhost:8090/api/v1/admin/collect/kbo
curl -X POST http://localhost:8090/api/v1/admin/collect/mlb
```

## 환경 변수

### Backend (`application-local.yml`)
| 변수 | 설명 |
|------|------|
| `FOOTBALL_DATA_KEY` | football-data.org API 키 |
| `DB_PASSWORD` | MariaDB 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 (256bit+) |

### Frontend (`.env.local`)
| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 URL |
| `NEXTAUTH_URL` | 프론트 URL |
| `NEXTAUTH_SECRET` | NextAuth 암호화 키 |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 Client Secret |
| `GOOGLE_CLIENT_ID` | 구글 OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | 구글 OAuth Client Secret |

## 커버 리그

| 종목 | 리그 | 팀 수 |
|------|------|-------|
| 축구 | EPL, 라리가, 분데스리가, 세리에A, 리그앙 | 96팀 |
| 축구 | K리그1, K리그2 | 29팀 |
| 야구 | KBO | 10팀 |
| 야구 | MLB | 30팀 |
| **합계** | **9개 리그** | **~165팀** |
