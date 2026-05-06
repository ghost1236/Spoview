package kr.smiling.sportshub.external.football.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballResponse<T>(
    val response: List<T> = emptyList(),
    val results: Int = 0,
    val paging: Paging? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Paging(val current: Int = 1, val total: Int = 1)

// ─── Standings ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class StandingsData(
    val league: LeagueStandings? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class LeagueStandings(
    val id: Int = 0,
    val name: String = "",
    val season: Int = 0,
    val standings: List<List<StandingEntry>> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class StandingEntry(
    val rank: Int = 0,
    val team: TeamRef? = null,
    val points: Int = 0,
    val goalsDiff: Int = 0,
    val form: String? = null,
    val description: String? = null,
    val all: MatchRecord? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TeamRef(
    val id: Int = 0,
    val name: String = "",
    val logo: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MatchRecord(
    val played: Int = 0,
    val win: Int = 0,
    val draw: Int = 0,
    val lose: Int = 0,
    val goals: GoalRecord? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GoalRecord(
    @JsonProperty("for") val goalsFor: Int = 0,
    val against: Int = 0
)

// ─── Fixtures ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureData(
    val fixture: FixtureInfo? = null,
    val league: FixtureLeague? = null,
    val teams: FixtureTeams? = null,
    val goals: FixtureGoals? = null,
    val score: FixtureScore? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureInfo(
    val id: Int = 0,
    val date: String = "",
    val timestamp: Long = 0,
    val venue: Venue? = null,
    val status: FixtureStatus? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Venue(val name: String? = null, val city: String? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureStatus(
    val long: String = "",
    val short: String = "",
    val elapsed: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureLeague(
    val id: Int = 0,
    val name: String = "",
    val season: Int = 0,
    val round: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureTeams(
    val home: TeamRef? = null,
    val away: TeamRef? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureGoals(
    val home: Int? = null,
    val away: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FixtureScore(
    val halftime: FixtureGoals? = null,
    val fulltime: FixtureGoals? = null
)
