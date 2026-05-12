package kr.smiling.sportshub.domain.community

import kr.smiling.sportshub.domain.user.User
import jakarta.persistence.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

@Entity
@Table(name = "notifications")
class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: NotificationType,

    @Column(nullable = false, length = 200)
    val title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val body: String,

    @Column(columnDefinition = "JSON")
    val data: String? = null,

    @Column(nullable = false)
    var isRead: Boolean = false,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class NotificationType {
    MATCH_START,
    GOAL,
    RESULT,
    TRANSFER,
    COMMUNITY
}

interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findByUser_IdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Page<Notification>
    fun countByUser_IdAndIsRead(userId: Long, isRead: Boolean): Long
}

@Entity
@Table(name = "push_tokens")
class PushToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, length = 500)
    val token: String,

    @Column(nullable = false)
    val deviceType: String = "WEB",

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

interface PushTokenRepository : JpaRepository<PushToken, Long> {
    fun findByUser_Id(userId: Long): List<PushToken>
    fun findByUser_IdAndToken(userId: Long, token: String): PushToken?
    fun deleteByUser_IdAndToken(userId: Long, token: String)
}
