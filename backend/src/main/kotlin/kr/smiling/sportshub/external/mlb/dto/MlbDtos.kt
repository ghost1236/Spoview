package kr.smiling.sportshub.external.mlb.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

// ─── Schedule ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbScheduleResponse(
    val dates: List<MlbScheduleDate> = emptyList(),
    val totalGames: Int = 0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbScheduleDate(
    val date: String = "",
    val games: List<MlbGame> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbGame(
    val gamePk: Int = 0,
    val gameDate: String = "",
    val officialDate: String? = null,
    val status: MlbGameStatus? = null,
    val teams: MlbGameTeams? = null,
    val venue: MlbVenue? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbGameStatus(
    val abstractGameState: String = "",
    val detailedState: String = "",
    val statusCode: String = ""
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbGameTeams(
    val away: MlbGameTeam? = null,
    val home: MlbGameTeam? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbGameTeam(
    val team: MlbTeamRef? = null,
    val score: Int? = null,
    val isWinner: Boolean? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbTeamRef(
    val id: Int = 0,
    val name: String = ""
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbVenue(
    val id: Int = 0,
    val name: String = ""
)

// ─── Standings ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbStandingsResponse(
    val records: List<MlbStandingRecord> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbStandingRecord(
    val standingsType: String? = null,
    val division: MlbDivision? = null,
    val teamRecords: List<MlbTeamRecord> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbDivision(
    val id: Int = 0,
    val name: String = ""
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbTeamRecord(
    val team: MlbTeamRef? = null,
    val wins: Int = 0,
    val losses: Int = 0,
    val winningPercentage: String? = null,
    val gamesBack: String? = null,
    val wildCardGamesBack: String? = null,
    val streak: MlbStreak? = null,
    val runsScored: Int = 0,
    val runsAllowed: Int = 0,
    val runDifferential: Int = 0,
    val divisionRank: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MlbStreak(
    val streakCode: String? = null
)
