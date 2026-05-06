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

enum class ActivityType {
    POST,       // 게시글 작성 +5
    COMMENT,    // 댓글 작성 +2
    LIKE,       // 좋아요 +1
    PREDICTION, // 예측 참여 +3
    LOGIN       // 일일 로그인 +1
}

interface FanActivityRepository : JpaRepository<FanActivity, Long> {
    @Query("SELECT COALESCE(SUM(f.points), 0) FROM FanActivity f WHERE f.user.id = :userId")
    fun getTotalPoints(userId: Long): Int

    fun countByUser_IdAndActivityTypeAndCreatedAtAfter(
        userId: Long, activityType: ActivityType, after: LocalDateTime
    ): Long
}
