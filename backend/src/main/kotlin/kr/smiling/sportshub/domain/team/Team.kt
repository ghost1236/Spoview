package kr.smiling.sportshub.domain.team

import kr.smiling.sportshub.domain.common.SportType
import jakarta.persistence.*

@Entity
@Table(name = "teams")
class Team(
    @Id
    @Column(name = "team_code", length = 10)
    val teamCode: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_code", nullable = false)
    val league: League,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val sportType: SportType,

    @Column(nullable = false, length = 50)
    val nameKo: String,

    @Column(nullable = false, length = 50)
    val nameEn: String,

    @Column(length = 500)
    val logoUrl: String? = null,

    val apiFootballId: Int? = null,

    val mlbTeamId: Int? = null,

    @Column(nullable = false)
    val displayOrder: Int = 0
)
