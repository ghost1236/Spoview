package kr.smiling.sportshub.domain.user

import kr.smiling.sportshub.domain.team.Team
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "user_team_subscriptions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "team_code"])]
)
class UserTeamSubscription(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_code", nullable = false)
    val team: Team,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
