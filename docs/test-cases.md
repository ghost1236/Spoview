# 테스트케이스 문서

## 개요
- 기반 문서: docs/plan.md
- 작성일: 2026-05-12
- 총 케이스 수: 35개
- 테스트 대상: Service 레이어 단위 테스트 (AuthService, SubscriptionService, PostService, FanLevelService, NotificationService)
- 테스트 도구: JUnit5 + MockK

---

## 테스트케이스 목록

### TC-001 신규 유저 OAuth 로그인 시 회원가입 후 JWT 발급
- 유저스토리 참조: 인증 - OAuth 로그인(카카오/네이버/구글) -> JWT 발급
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 해당 provider/providerId로 등록된 유저 없음
- 테스트 단계:
  1. LoginRequest(provider=KAKAO, providerId=12345, email, nickname) 전달
  2. userRepository.findByProviderAndProviderId -> null 반환
  3. userRepository.save 호출 확인
  4. jwtTokenProvider.generateToken 호출 확인
- 기대 결과: AuthResponse(token, userId, nickname) 정상 반환. 회원가입 포인트(SIGNUP) + 로그인 포인트(LOGIN) 적립
- 엣지 케이스:
  - 이메일이 빈 문자열인 경우 null로 저장
- 자동화 여부: 가능

### TC-002 기존 유저 OAuth 로그인 시 JWT 발급
- 유저스토리 참조: 인증 - OAuth 로그인 -> JWT 발급
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 해당 provider/providerId로 등록된 유저 존재
- 테스트 단계:
  1. LoginRequest 전달
  2. userRepository.findByProviderAndProviderId -> 기존 User 반환
  3. jwtTokenProvider.generateToken 호출 확인
- 기대 결과: AuthResponse 반환, 회원가입 포인트 미적립, 로그인 포인트만 적립
- 자동화 여부: 가능

### TC-003 기존 유저 이메일 없을 때 이메일 업데이트
- 유저스토리 참조: 인증 - 이메일 후속 업데이트
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 기존 유저의 email이 null
- 테스트 단계:
  1. 이메일이 null인 기존 유저 반환
  2. LoginRequest에 이메일 포함하여 호출
- 기대 결과: user.email이 새 이메일로 업데이트됨
- 자동화 여부: 가능

### TC-004 잘못된 provider 값 로그인 시 예외
- 유저스토리 참조: 인증 - 예외 처리
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 없음
- 테스트 단계:
  1. provider="INVALID"로 LoginRequest 전달
- 기대 결과: IllegalArgumentException 발생
- 자동화 여부: 가능

---

### TC-005 팀 구독 추가 성공
- 유저스토리 참조: 팀 구독 - 구독 CRUD
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 유저와 팀이 존재하고, 아직 구독하지 않은 상태
- 테스트 단계:
  1. subscribe(userId, teamCode) 호출
  2. 중복 체크 -> false
  3. 유저/팀 조회 성공
  4. subscriptionRepository.save 호출
- 기대 결과: TeamResponse 반환, TEAM_SUBSCRIBE 포인트 적립
- 자동화 여부: 가능

### TC-006 중복 구독 시 예외
- 유저스토리 참조: 팀 구독 - 중복 구독 방지
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 이미 해당 팀을 구독한 상태
- 테스트 단계:
  1. subscribe(userId, teamCode) 호출
  2. existsByUser_IdAndTeam_TeamCode -> true
- 기대 결과: BusinessException(ALREADY_SUBSCRIBED) 발생
- 자동화 여부: 가능

### TC-007 존재하지 않는 유저로 구독 시 예외
- 유저스토리 참조: 팀 구독 - 예외 처리
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: userId에 해당하는 유저 없음
- 테스트 단계:
  1. subscribe(userId, teamCode) 호출
  2. userRepository.findById -> empty
- 기대 결과: BusinessException(USER_NOT_FOUND)
- 자동화 여부: 가능

### TC-008 존재하지 않는 팀 구독 시 예외
- 유저스토리 참조: 팀 구독 - 예외 처리
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: teamCode에 해당하는 팀 없음
- 테스트 단계:
  1. subscribe(userId, teamCode) 호출
  2. teamRepository.findByTeamCode -> null
- 기대 결과: BusinessException(TEAM_NOT_FOUND)
- 자동화 여부: 가능

### TC-009 구독 해지 성공
- 유저스토리 참조: 팀 구독 - 구독 해지
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 해당 구독이 존재
- 테스트 단계:
  1. unsubscribe(userId, teamCode) 호출
  2. deleteByUser_IdAndTeam_TeamCode 호출 확인
- 기대 결과: 정상 삭제
- 자동화 여부: 가능

### TC-010 구독 목록 조회
- 유저스토리 참조: 팀 구독 - 구독 조회
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 유저가 1개 이상 팀 구독
- 테스트 단계:
  1. getSubscriptions(userId) 호출
- 기대 결과: List<TeamResponse> 반환
- 자동화 여부: 가능

---

### TC-011 게시글 작성 성공
- 유저스토리 참조: 커뮤니티 - 게시글 CRUD
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 유저, 팀 존재
- 테스트 단계:
  1. createPost(userId, CreatePostRequest) 호출
  2. userRepository, teamRepository 조회 확인
  3. postRepository.save 확인
- 기대 결과: 게시글 ID 반환, POST 활동 포인트 적립, 첫 게시글 보너스 체크
- 자동화 여부: 가능

### TC-012 이미지 첨부 게시글 작성
- 유저스토리 참조: 커뮤니티 - 게시글 이미지 첨부
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 유저, 팀, 업로드된 이미지 존재
- 테스트 단계:
  1. imageIds를 포함한 CreatePostRequest로 createPost 호출
  2. postImageRepository.findByIdIn 확인
- 기대 결과: 이미지가 게시글에 연결됨
- 자동화 여부: 가능

### TC-013 존재하지 않는 유저로 게시글 작성 시 예외
- 유저스토리 참조: 커뮤니티 - 예외 처리
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: userId에 해당하는 유저 없음
- 테스트 단계:
  1. createPost(invalidUserId, request) 호출
- 기대 결과: BusinessException(USER_NOT_FOUND)
- 자동화 여부: 가능

### TC-014 게시글 수정 성공
- 유저스토리 참조: 커뮤니티 - 게시글 수정
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글 존재, 작성자 본인
- 테스트 단계:
  1. updatePost(postId, userId, UpdatePostRequest) 호출
- 기대 결과: title, content 업데이트됨
- 자동화 여부: 가능

### TC-015 타인의 게시글 수정 시 FORBIDDEN 예외
- 유저스토리 참조: 커뮤니티 - 권한 체크
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글의 작성자와 다른 userId
- 테스트 단계:
  1. updatePost(postId, otherUserId, request) 호출
- 기대 결과: BusinessException(FORBIDDEN)
- 자동화 여부: 가능

### TC-016 게시글 삭제 성공
- 유저스토리 참조: 커뮤니티 - 게시글 삭제
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글 존재, 작성자 본인
- 테스트 단계:
  1. deletePost(postId, userId) 호출
- 기대 결과: postRepository.delete 호출됨
- 자동화 여부: 가능

### TC-017 타인의 게시글 삭제 시 FORBIDDEN 예외
- 유저스토리 참조: 커뮤니티 - 권한 체크
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글의 작성자와 다른 userId
- 테스트 단계:
  1. deletePost(postId, otherUserId) 호출
- 기대 결과: BusinessException(FORBIDDEN)
- 자동화 여부: 가능

### TC-018 좋아요 토글 - 좋아요 추가
- 유저스토리 참조: 커뮤니티 - 좋아요 토글
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 해당 게시글에 좋아요 안 한 상태
- 테스트 단계:
  1. toggleLike(userId, postId) 호출
  2. likeRepository.findByUser_IdAndTargetTypeAndTargetId -> null
- 기대 결과: true 반환, likeCount 증가, LIKE 포인트 적립
- 자동화 여부: 가능

### TC-019 좋아요 토글 - 좋아요 취소
- 유저스토리 참조: 커뮤니티 - 좋아요 토글
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 해당 게시글에 이미 좋아요한 상태
- 테스트 단계:
  1. toggleLike(userId, postId) 호출
  2. likeRepository.findByUser_IdAndTargetTypeAndTargetId -> Like 반환
- 기대 결과: false 반환, likeCount 감소
- 자동화 여부: 가능

### TC-020 댓글 작성 성공
- 유저스토리 참조: 커뮤니티 - 댓글
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글, 유저 존재
- 테스트 단계:
  1. createComment(postId, userId, CreateCommentRequest) 호출
- 기대 결과: 댓글 ID 반환, COMMENT 포인트 적립
- 자동화 여부: 가능

### TC-021 대댓글 작성 성공
- 유저스토리 참조: 커뮤니티 - 대댓글
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글, 유저, 부모 댓글 존재
- 테스트 단계:
  1. createComment(postId, userId, CreateCommentRequest(parentId=부모ID)) 호출
- 기대 결과: 대댓글 ID 반환
- 자동화 여부: 가능

### TC-022 게시글 상세 조회 + 조회수 증가
- 유저스토리 참조: 커뮤니티 - 게시글 조회
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 게시글 존재
- 테스트 단계:
  1. getPostDetail(postId, userId) 호출
- 기대 결과: PostDetailResponse 반환, viewCount 1 증가
- 자동화 여부: 가능

### TC-023 게시글 목록 조회 (카테고리 필터)
- 유저스토리 참조: 커뮤니티 - 게시글 목록
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 해당 팀 게시글 존재
- 테스트 단계:
  1. getPosts(teamCode, "FREE", pageable) 호출
- 기대 결과: Page<PostListResponse> 반환
- 자동화 여부: 가능

---

### TC-024 활동 포인트 적립 (게시글)
- 유저스토리 참조: 팬 레벨 - 활동 포인트 적립
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 유저 존재
- 테스트 단계:
  1. recordActivity(userId, ActivityType.POST) 호출
- 기대 결과: FanActivity 저장 (5 포인트), totalPoints 갱신
- 자동화 여부: 가능

### TC-025 일일 로그인 중복 방지
- 유저스토리 참조: 팬 레벨 - 일일 로그인 중복 방지
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 오늘 이미 로그인 기록 존재
- 테스트 단계:
  1. recordActivity(userId, ActivityType.LOGIN) 호출
  2. 오늘 로그인 카운트 > 0
- 기대 결과: 포인트 미적립 (조기 리턴)
- 자동화 여부: 가능

### TC-026 회원가입 포인트 중복 방지
- 유저스토리 참조: 팬 레벨 - 회원가입 포인트
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 이미 SIGNUP 활동 기록 존재
- 테스트 단계:
  1. recordActivity(userId, ActivityType.SIGNUP) 호출
- 기대 결과: 포인트 미적립
- 자동화 여부: 가능

### TC-027 레벨 계산 정확성
- 유저스토리 참조: 팬 레벨 - 레벨 계산
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 없음
- 테스트 단계:
  1. 다양한 총 포인트에 대해 getFanLevel 호출
  2. 0P -> Lv.1, 50P -> Lv.2, 150P -> Lv.3, 400P -> Lv.4, 1000P -> Lv.5
- 기대 결과: 정확한 레벨, 레벨명, progress 값
- 엣지 케이스:
  - 경계값: 49P (Lv.1), 50P (Lv.2)
  - 최대 레벨 도달 시 progress 100
- 자동화 여부: 가능

### TC-028 레벨업 시 유저 fanLevel 갱신
- 유저스토리 참조: 팬 레벨 - 레벨업
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 현재 Lv.1, 포인트 적립 후 50P 도달
- 테스트 단계:
  1. recordActivity(userId, ActivityType.SIGNUP) 호출
  2. getTotalPoints -> 50 반환
- 기대 결과: user.fanLevel이 2로 갱신
- 자동화 여부: 가능

### TC-029 첫 게시글 보너스 적립
- 유저스토리 참조: 팬 레벨 - 첫 게시글 보너스
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: FIRST_POST 활동 기록 없음
- 테스트 단계:
  1. checkFirstPost(userId) 호출
- 기대 결과: FIRST_POST 20P 적립
- 자동화 여부: 가능

### TC-030 좋아요 마일스톤 보너스 (10개)
- 유저스토리 참조: 팬 레벨 - 좋아요 마일스톤
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 게시글 좋아요가 10개에 도달
- 테스트 단계:
  1. checkLikeMilestone(postAuthorId, 10) 호출
- 기대 결과: LIKE_MILESTONE 10P 적립
- 자동화 여부: 가능

---

### TC-031 알림 생성 성공
- 유저스토리 참조: 알림 - 알림 생성
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 유저 존재
- 테스트 단계:
  1. createNotification(userId, MATCH_START, title, body) 호출
- 기대 결과: notificationRepository.save 호출, 푸시 발송 시도
- 자동화 여부: 가능

### TC-032 알림 읽음 처리
- 유저스토리 참조: 알림 - 읽음 처리
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 알림 존재, 본인 소유
- 테스트 단계:
  1. markAsRead(userId, notificationId) 호출
- 기대 결과: isRead = true
- 자동화 여부: 가능

### TC-033 타인의 알림 읽음 처리 시 FORBIDDEN
- 유저스토리 참조: 알림 - 권한 체크
- 테스트 유형: 단위
- 우선순위: High
- 전제조건: 알림이 다른 유저 소유
- 테스트 단계:
  1. markAsRead(otherUserId, notificationId) 호출
- 기대 결과: BusinessException(FORBIDDEN)
- 자동화 여부: 가능

### TC-034 읽지 않은 알림 개수 조회
- 유저스토리 참조: 알림 - 알림 카운트
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 읽지 않은 알림 3건 존재
- 테스트 단계:
  1. getUnreadCount(userId) 호출
- 기대 결과: 3 반환
- 자동화 여부: 가능

### TC-035 전체 알림 읽음 처리
- 유저스토리 참조: 알림 - 전체 읽음
- 테스트 유형: 단위
- 우선순위: Medium
- 전제조건: 읽지 않은 알림 다수 존재
- 테스트 단계:
  1. markAllAsRead(userId) 호출
- 기대 결과: 해당 유저의 모든 알림이 isRead = true
- 자동화 여부: 가능
