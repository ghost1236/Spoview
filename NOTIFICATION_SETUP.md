# Spoview 알림 시스템 설정 가이드

> 최종 수정: 2026-05-08

## 알림 구조

```
경기 시작 / 득점 / 결과 이벤트
    ↓
스케줄러가 감지 (데이터 수집 시)
    ↓
NotificationService.notifyTeamSubscribers()
    ↓
DB에 알림 저장 + Web Push 발송 (VAPID)
    ↓
Service Worker가 수신 → 브라우저 알림 표시
    ↓
(브라우저 닫혀있어도 동작)
```

---

## 1. 인앱 알림 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/v1/notifications` | 알림 목록 (페이지네이션) | O |
| GET | `/api/v1/notifications/unread-count` | 안 읽은 알림 수 | O |
| POST | `/api/v1/notifications/{id}/read` | 특정 알림 읽음 처리 | O |
| POST | `/api/v1/notifications/read-all` | 전체 읽음 처리 | O |
| POST | `/api/v1/notifications/push-token` | Push subscription 등록 | O |
| DELETE | `/api/v1/notifications/push-token` | Push subscription 제거 | O |
| GET | `/api/v1/notifications/vapid-key` | VAPID 공개키 조회 | X |

### 알림 타입

| 타입 | 발생 시점 | 온보딩 설정 |
|------|----------|-----------|
| `MATCH_START` | 내 팀 경기 시작 시 | 경기 시작 |
| `GOAL` | 내 팀 득점/실점 시 | 득점/주요 이벤트 |
| `RESULT` | 내 팀 경기 종료 시 | 경기 결과 |
| `TRANSFER` | 이적/소식 등록 시 | 이적/소식 |
| `COMMUNITY` | 내 글에 댓글/좋아요 시 | 커뮤니티 활동 |

---

## 2. Web Push 설정 (VAPID)

> Firebase/FCM 대신 **VAPID 기반 Web Push**를 사용합니다.
> 별도 Firebase 프로젝트 불필요, 무료, 직접 제어 가능.

### 2-1. VAPID 키 생성

```bash
npx web-push generate-vapid-keys --json
```

출력 예시:
```json
{
  "publicKey": "BM7BsqDrbZD-FwhJ3qxb...",
  "privateKey": "8LQVLKNLiSutAqwpXpe0..."
}
```

### 2-2. 환경 변수 설정

#### 프론트엔드 (`frontend/.env.local`)

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BM7BsqDrbZD-FwhJ3qxb...  # 공개키
```

#### 백엔드 (환경변수 또는 `application-prod.yml`)

```bash
VAPID_PUBLIC_KEY=BM7BsqDrbZD-FwhJ3qxb...   # 공개키
VAPID_PRIVATE_KEY=8LQVLKNLiSutAqwpXpe0...  # 비공개키
```

또는 `application.yml`:
```yaml
webpush:
  vapid:
    public-key: ${VAPID_PUBLIC_KEY:}
    private-key: ${VAPID_PRIVATE_KEY:}
    subject: mailto:smiling1236@gmail.com
```

### 2-3. 구현 파일 구조

#### 프론트엔드

| 파일 | 설명 |
|------|------|
| `public/sw.js` | Service Worker — 백그라운드 푸시 수신, 클릭 시 앱 포커스 |
| `src/lib/useNotifications.ts` | SW 등록 + Push 구독 + 서버에 토큰 전송 + 클라이언트 폴링 |
| `src/lib/store.ts` | `notifSettings`, `notifPermission` 상태 관리 |
| `src/app/(main)/layout.tsx` | `useMatchNotifications()` 훅 실행 |
| `src/app/(main)/mypage/page.tsx` | 알림 설정 토글 UI |
| `src/app/(auth)/onboarding/page.tsx` | Step 3: 알림 종류 선택 + 권한 요청 |

#### 백엔드

| 파일 | 설명 |
|------|------|
| `config/ObjectStorageConfig.kt` | — |
| `domain/community/Notification.kt` | Notification + PushToken 엔티티 |
| `service/NotificationService.kt` | 알림 생성 + Web Push 발송 (web-push 라이브러리) |
| `controller/NotificationController.kt` | 알림 REST API |
| `resources/db/migration/V5__notifications.sql` | notifications + push_tokens 테이블 |

#### 백엔드 의존성 (`build.gradle.kts`)
```kotlin
implementation("nl.martijndwars:web-push:5.1.1")
implementation("org.bouncycastle:bcprov-jdk18on:1.78.1")
```

---

## 3. 알림 흐름

### 사용자 구독 등록 흐름

```
1. 온보딩 Step 3에서 알림 설정 ON
2. 브라우저 Notification.requestPermission() → "granted"
3. Service Worker 등록 (public/sw.js)
4. pushManager.subscribe(VAPID 공개키) → PushSubscription 객체
5. POST /api/v1/notifications/push-token (subscription JSON 전송)
6. 서버 push_tokens 테이블에 저장
```

### 알림 발송 흐름

```
스케줄러: 경기 상태 변경 감지
    ↓
NotificationService.notifyTeamSubscribers(teamCode, type, title, body)
    ↓
해당 팀 구독자 조회 (user_team_subscriptions)
    ↓
각 유저:
  ├─ notifications 테이블에 인앱 알림 저장
  └─ push_tokens에서 해당 유저의 subscription 조회
       └─ web-push 라이브러리로 Web Push 발송
            └─ Service Worker가 수신 → 시스템 알림 표시
```

### 클라이언트 폴링 (브라우저 열려있을 때)

```
useMatchNotifications() 훅 (60초 간격)
    ↓
getTodayMatches() API 호출
    ↓
이전 상태와 비교
    ↓
변경 감지 시 브라우저 Notification API로 즉시 알림
```

---

## 4. 알림 트리거 시점

### 경기 시작

```
LiveScoreScheduler (5분 간격)
  → status가 SCHEDULED → LIVE로 변경 감지
  → notificationService.notifyTeamSubscribers(teamCode, MATCH_START, ...)
```

### 득점

```
LiveScoreScheduler
  → homeScore 또는 awayScore 변경 감지
  → notificationService.notifyTeamSubscribers(teamCode, GOAL, ...)
```

### 경기 결과

```
FootballDataScheduler / MlbDataScheduler / KboDataScheduler
  → status가 LIVE → FINISHED로 변경 감지
  → notificationService.notifyTeamSubscribers(teamCode, RESULT, ...)
```

### 커뮤니티

```
PostService.createComment()
  → 게시글 작성자에게 COMMUNITY 알림
PostService.toggleLike()
  → 게시글 작성자에게 COMMUNITY 알림
```

---

## 5. 설정 체크리스트

| 단계 | 상태 | 설명 |
|------|------|------|
| VAPID 키 생성 | 필요 | `npx web-push generate-vapid-keys --json` |
| 프론트 환경변수 | 필요 | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` |
| 백엔드 환경변수 | 필요 | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Service Worker | 구현 완료 | `public/sw.js` |
| Push 구독 로직 | 구현 완료 | `useNotifications.ts` |
| 백엔드 발송 | 구현 완료 | `NotificationService.kt` (web-push) |
| DB 마이그레이션 | 구현 완료 | `V5__notifications.sql` |
| HTTPS | 운영 필수 | Service Worker는 HTTPS에서만 동작 (localhost 예외) |
| 스케줄러 연동 | 코드 위치 확인 | 각 스케줄러에서 상태 변경 시 알림 호출 필요 |

---

## 6. 소셜 로그인 API 키 발급

### 카카오

1. [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 앱 추가
2. REST API 키 복사
3. 카카오 로그인 활성화 → 동의 항목 (닉네임, 이메일)
4. Redirect URI: `https://your-domain.com/api/auth/callback/kakao`

```bash
KAKAO_CLIENT_ID=REST_API_키
KAKAO_CLIENT_SECRET=보안_탭에서_생성
```

### 네이버

1. [developers.naver.com](https://developers.naver.com) → 애플리케이션 등록
2. 사용 API: 네이버 로그인
3. 제공 정보: 이름, 이메일, 프로필 사진
4. Callback URL: `https://your-domain.com/api/auth/callback/naver`

```bash
NAVER_CLIENT_ID=Client_ID
NAVER_CLIENT_SECRET=Client_Secret
```

### 구글

1. [console.cloud.google.com](https://console.cloud.google.com) → OAuth 클라이언트 ID
2. 승인된 리디렉션 URI: `https://your-domain.com/api/auth/callback/google`

```bash
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=시크릿
```

### NextAuth 공통

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=openssl_rand_-base64_32로_생성
```

---

## 7. AdSense 광고 설정

### 가입

1. [google.com/adsense](https://www.google.com/adsense) 가입
2. 사이트 추가 → 승인 (1~14일)
3. 승인 조건: 컨텐츠 10개+, 이용약관/개인정보처리방침 페이지, HTTPS, 커스텀 도메인

### 설정

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 광고 배치 (구현 완료)

| 위치 | 파일 | slot |
|------|------|------|
| 홈 하단 | `page.tsx` | `home-bottom` |
| 팀 상세 하단 | `teams/page.tsx` | `team-side` |
| 커뮤니티 인피드 | `community/page.tsx` | `community-feed` (5개마다) |

개발 모드에서는 "AD · slot명" 플레이스홀더로 표시, 프로덕션에서만 실제 광고 로드.

---

## 8. Naver Cloud Object Storage (이미지 저장)

```bash
NCLOUD_ACCESS_KEY=네이버클라우드_Access_Key
NCLOUD_SECRET_KEY=네이버클라우드_Secret_Key
NCLOUD_BUCKET=sportshub-images
NCLOUD_CDN_URL=https://your-cdn.cdn.ntruss.com  # CDN 사용 시 (선택)
```

네이버 클라우드 콘솔:
1. Object Storage 버킷 생성 (`sportshub-images`)
2. 버킷 권한: 공개 읽기
3. API 인증키 발급 (마이페이지 → 인증키 관리)

---

## 9. 전체 환경변수 체크리스트

### 프론트엔드 (`frontend/.env.local`)

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXX
```

### 백엔드 (환경변수)

```bash
# DB
DB_URL=jdbc:mariadb://localhost:3306/sportshub
DB_USERNAME=
DB_PASSWORD=

# 인증
JWT_SECRET=

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Naver Cloud Object Storage
NCLOUD_ACCESS_KEY=
NCLOUD_SECRET_KEY=
NCLOUD_BUCKET=sportshub-images

# 외부 API
API_FOOTBALL_KEY=
```
