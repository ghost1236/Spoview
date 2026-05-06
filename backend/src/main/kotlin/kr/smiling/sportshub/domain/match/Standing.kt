package kr.smiling.sportshub.domain.match

import kr.smiling.sportshub.domain.team.League
import kr.smiling.sportshub.domain.team.Team
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "standings",
    uniqueConstraints = [UniqueConstraint(columnNames = ["league_code", "team_code", "season_year"])]
)
class Standing(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_code", nullable = false)
    val league: League,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_code", nullable = false)
    val team: Team,

    @Column(nullable = false)
    val seasonYear: Int,

    @Column(nullable = false)
    var rankPosition: Int,

    @Column(nullable = false)
    var played: Int = 0,

    @Column(nullable = false)
    var won: Int = 0,

    @Column(nullable = false)
    var drawn: Int = 0,

    @Column(nullable = false)
    var lost: Int = 0,

    @Column(nullable = false)
    var goalsFor: Int = 0,

    @Column(nullable = false)
    var goalsAgainst: Int = 0,

    @Column(nullable = false)
    var goalDiff: Int = 0,

    @Column(nullable = false)
    var points: Int = 0,

    @Column(length = 10)
    var winningPct: String? = null,

    @Column(length = 10)
    var gamesBack: String? = null,

    @Column(length = 10)
    var form: String? = null,

    @Column(length = 100)
    var zoneDescription: String? = null,

    @Column(length = 50)
    var division: String? = null,

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
