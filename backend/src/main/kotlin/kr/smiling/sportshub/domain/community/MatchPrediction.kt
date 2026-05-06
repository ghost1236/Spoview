package kr.smiling.sportshub.domain.community

import kr.smiling.sportshub.domain.match.Match
import kr.smiling.sportshub.domain.user.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "match_predictions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["match_id", "user_id"])]
)
class MatchPrediction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    val match: Match,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val prediction: PredictionChoice,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class PredictionChoice {
    HOME,
    DRAW,
    AWAY
}
