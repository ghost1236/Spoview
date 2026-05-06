package kr.smiling.sportshub.external.football.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

// ─── Standings ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdStandingsResponse(
    val competition: FdCompetition? = null,
    val season: FdSeason? = null,
    val standings: List<FdStandingGroup> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdCompetition(
    val id: Int = 0,
    val name: String = "",
    val code: String = "",
    val emblem: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdSeason(
    val id: Int = 0,
    val startDate: String = "",
    val endDate: String = "",
    val currentMatchday: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdStandingGroup(
    val stage: String = "",
    val type: String = "",      // TOTAL, HOME, AWAY
    val table: List<FdTableEntry> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdTableEntry(
    val position: Int = 0,
    val team: FdTeamRef? = null,
    val playedGames: Int = 0,
    val form: String? = null,   // "W,W,D,L,W"
    val won: Int = 0,
    val draw: Int = 0,
    val lost: Int = 0,
    val points: Int = 0,
    val goalsFor: Int = 0,
    val goalsAgainst: Int = 0,
    val goalDifference: Int = 0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdTeamRef(
    val id: Int = 0,
    val name: String = "",
    val shortName: String? = null,
    val tla: String? = null,
    val crest: String? = null
)

// ─── Matches ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdMatchesResponse(
    val competition: FdCompetition? = null,
    val matches: List<FdMatch> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdMatch(
    val id: Int = 0,
    val utcDate: String = "",
    val status: String = "",        // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, etc.
    val matchday: Int? = null,
    val stage: String? = null,
    val venue: String? = null,
    val homeTeam: FdTeamRef? = null,
    val awayTeam: FdTeamRef? = null,
    val score: FdScore? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdScore(
    val winner: String? = null,     // HOME_TEAM, AWAY_TEAM, DRAW, null
    val duration: String? = null,
    val fullTime: FdGoals? = null,
    val halfTime: FdGoals? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdGoals(
    val home: Int? = null,
    val away: Int? = null
)

// ─── Teams ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdTeamsResponse(
    val competition: FdCompetition? = null,
    val teams: List<FdTeamDetail> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FdTeamDetail(
    val id: Int = 0,
    val name: String = "",
    val shortName: String? = null,
    val tla: String? = null,
    val crest: String? = null,
    val venue: String? = null
)
