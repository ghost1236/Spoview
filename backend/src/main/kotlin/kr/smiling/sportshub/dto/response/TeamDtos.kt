package kr.smiling.sportshub.dto.response

import kr.smiling.sportshub.domain.team.League
import kr.smiling.sportshub.domain.team.Team

data class LeagueResponse(
    val leagueCode: String,
    val sportType: String,
    val nameKo: String,
    val nameEn: String,
    val country: String,
    val logoUrl: String?,
    val seasonYear: Int
) {
    companion object {
        fun from(league: League) = LeagueResponse(
            leagueCode = league.leagueCode,
            sportType = league.sportType.name,
            nameKo = league.nameKo,
            nameEn = league.nameEn,
            country = league.country,
            logoUrl = league.logoUrl,
            seasonYear = league.seasonYear
        )
    }
}

data class TeamResponse(
    val teamCode: String,
    val leagueCode: String,
    val sportType: String,
    val nameKo: String,
    val nameEn: String,
    val logoUrl: String?
) {
    companion object {
        fun from(team: Team) = TeamResponse(
            teamCode = team.teamCode,
            leagueCode = team.league.leagueCode,
            sportType = team.sportType.name,
            nameKo = team.nameKo,
            nameEn = team.nameEn,
            logoUrl = team.logoUrl
        )
    }
}

data class TeamDetailResponse(
    val team: TeamResponse,
    val league: LeagueResponse
) {
    companion object {
        fun from(team: Team) = TeamDetailResponse(
            team = TeamResponse.from(team),
            league = LeagueResponse.from(team.league)
        )
    }
}
