package kr.smiling.sportshub.domain.user

import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

@Entity
@Table(name = "fan_activities")
class FanActivity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val activityType: ActivityType,

    @Column(nullable = false)
    val points: Int = 1,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class ActivityType(val defaultPoints: Int) {
    POST(5),              // 게시글 작성
    COMMENT(2),           // 댓글 작성
    LIKE(1),              // 좋아요
    LOGIN(1),             // 일일 로그인
    SIGNUP(50),            // 회원가입
    LOGIN_STREAK(3),       // 연속 로그인 7일 보너스
    LIKE_MILESTONE(10),    // 좋아요 10개 받음
    FIRST_POST(20),        // 첫 게시글 작성
    TEAM_SUBSCRIBE(5),     // 팀 구독 추가
    MATCH_CHECKIN(3),      // 경기 관전 체크인
}

interface FanActivityRepository : JpaRepository<FanActivity, Long> {
    @Query("SELECT COALESCE(SUM(f.points), 0) FROM FanActivity f WHERE f.user.id = :userId")
    fun getTotalPoints(userId: Long): Int

    fun countByUser_IdAndActivityTypeAndCreatedAtAfter(
        userId: Long, activityType: ActivityType, after: LocalDateTime
    ): Long
}
