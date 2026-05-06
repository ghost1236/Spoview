package kr.smiling.sportshub.domain.match

import kr.smiling.sportshub.domain.common.BaseEntity
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.team.League
import kr.smiling.sportshub.domain.team.Team
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "matches")
class Match(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_code", nullable = false)
    val league: League,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val sportType: SportType,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_code", nullable = false)
    val homeTeam: Team,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_code", nullable = false)
    val awayTeam: Team,

    @Column(nullable = false)
    var matchDate: LocalDateTime,

    var homeScore: Int? = null,
    var awayScore: Int? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: MatchStatus = MatchStatus.SCHEDULED,

    @Column(length = 50)
    var round: String? = null,

    @Column(length = 100)
    var venue: String? = null,

    @Column(length = 20)
    val apiMatchId: String? = null,

    @Column(columnDefinition = "JSON")
    var extraData: String? = null
) : BaseEntity()

enum class MatchStatus {
    SCHEDULED,
    LIVE,
    FINISHED,
    POSTPONED,
    CANCELLED
}
