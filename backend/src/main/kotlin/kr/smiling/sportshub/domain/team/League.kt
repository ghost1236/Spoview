package kr.smiling.sportshub.domain.team

import kr.smiling.sportshub.domain.common.SportType
import jakarta.persistence.*

@Entity
@Table(name = "leagues")
class League(
    @Id
    @Column(name = "league_code", length = 20)
    val leagueCode: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val sportType: SportType,

    @Column(nullable = false, length = 50)
    val nameKo: String,

    @Column(nullable = false, length = 50)
    val nameEn: String,

    @Column(nullable = false, length = 50)
    val country: String,

    val apiFootballId: Int? = null,

    @Column(length = 500)
    val logoUrl: String? = null,

    @Column(nullable = false)
    val seasonYear: Int,

    @Column(nullable = false)
    val displayOrder: Int = 0
)
