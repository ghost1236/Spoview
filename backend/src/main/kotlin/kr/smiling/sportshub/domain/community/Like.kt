package kr.smiling.sportshub.domain.community

import kr.smiling.sportshub.domain.user.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "likes",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "target_type", "target_id"])]
)
class Like(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val targetType: TargetType,

    @Column(nullable = false)
    val targetId: Long,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class TargetType {
    POST,
    COMMENT
}
