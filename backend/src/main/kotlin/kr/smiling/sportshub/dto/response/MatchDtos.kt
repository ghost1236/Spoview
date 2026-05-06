package kr.smiling.sportshub.dto.response

import kr.smiling.sportshub.domain.match.Match
import kr.smiling.sportshub.domain.match.Standing
import java.time.LocalDateTime

data class MatchResponse(
    val id: Long,
    val leagueCode: String,
    val sportType: String,
    val homeTeam: TeamResponse,
    val awayTeam: TeamResponse,
    val matchDate: LocalDateTime,
    val homeScore: Int?,
    val awayScore: Int?,
    val status: String,
    val round: String?,
    val venue: String?
) {
    companion object {
        fun from(match: Match) = MatchResponse(
            id = match.id,
            leagueCode = match.league.leagueCode,
            sportType = match.sportType.name,
            homeTeam = TeamResponse.from(match.homeTeam),
            awayTeam = TeamResponse.from(match.awayTeam),
            matchDate = match.matchDate,
            homeScore = match.homeScore,
            awayScore = match.awayScore,
            status = match.status.name,
            round = match.round,
            venue = match.venue
        )
    }
}

data class StandingResponse(
    val rank: Int,
    val team: TeamResponse,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int,
    val goalsFor: Int,
    val goalsAgainst: Int,
    val goalDiff: Int,
    val points: Int,
    val winningPct: String?,
    val gamesBack: String?,
    val form: String?,
    val zoneDescription: String?,
    val division: String?
) {
    companion object {
        fun from(standing: Standing) = StandingResponse(
            rank = standing.rankPosition,
            team = TeamResponse.from(standing.team),
            played = standing.played,
            won = standing.won,
            drawn = standing.drawn,
            lost = standing.lost,
            goalsFor = standing.goalsFor,
            goalsAgainst = standing.goalsAgainst,
            goalDiff = standing.goalDiff,
            points = standing.points,
            winningPct = standing.winningPct,
            gamesBack = standing.gamesBack,
            form = standing.form,
            zoneDescription = standing.zoneDescription,
            division = standing.division
        )
    }
}
