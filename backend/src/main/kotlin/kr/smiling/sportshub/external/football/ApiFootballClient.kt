package kr.smiling.sportshub.external.football

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

/**
 * API-Football v3 — K리그 전용 (football-data.org에서 K리그 미지원)
 * Free 플랜: 100 req/day, 2022-2024 시즌만 접근 가능
 * → K리그는 현재 시즌(2026) 접근 가능 (아시아 리그는 제한 없음)
 */
@Component
class ApiFootballClient(
    @Value("\${sportshub.api-football.api-key:}") private val apiKey: String
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val webClient = WebClient.builder()
        .baseUrl("https://v3.football.api-sports.io")
        .defaultHeader("x-apisports-key", apiKey)
        .build()

    val isAvailable: Boolean get() = apiKey.isNotBlank()

    suspend fun getStandings(leagueId: Int, season: Int): ApiFootballStandingsResponse {
        log.info("API-Football: GET /standings league={} season={}", leagueId, season)
        return webClient.get()
            .uri("/standings?league={id}&season={season}", leagueId, season)
            .retrieve()
            .awaitBody()
    }

    suspend fun getFixtures(leagueId: Int, season: Int, from: String, to: String): ApiFootballFixturesResponse {
        log.info("API-Football: GET /fixtures league={} from={} to={}", leagueId, from, to)
        return webClient.get()
            .uri("/fixtures?league={id}&season={season}&from={from}&to={to}", leagueId, season, from, to)
            .retrieve()
            .awaitBody()
    }
}

// ─── DTOs ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballStandingsResponse(val response: List<AfStandingsData> = emptyList())

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfStandingsData(val league: AfLeagueStandings? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfLeagueStandings(val standings: List<List<AfStandingEntry>> = emptyList())

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfStandingEntry(
    val rank: Int = 0,
    val team: AfTeamRef? = null,
    val points: Int = 0,
    val goalsDiff: Int = 0,
    val form: String? = null,
    val description: String? = null,
    val all: AfMatchRecord? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfTeamRef(val id: Int = 0, val name: String = "")

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfMatchRecord(val played: Int = 0, val win: Int = 0, val draw: Int = 0, val lose: Int = 0, val goals: AfGoals? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfGoals(val `for`: Int = 0, val against: Int = 0)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApiFootballFixturesResponse(val response: List<AfFixtureData> = emptyList())

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfFixtureData(
    val fixture: AfFixtureInfo? = null,
    val league: AfFixtureLeague? = null,
    val teams: AfFixtureTeams? = null,
    val goals: AfFixtureGoals? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfFixtureInfo(val id: Int = 0, val date: String = "", val status: AfStatus? = null, val venue: AfVenue? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfStatus(val short: String = "")

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfVenue(val name: String? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfFixtureLeague(val round: String? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfFixtureTeams(val home: AfTeamRef? = null, val away: AfTeamRef? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AfFixtureGoals(val home: Int? = null, val away: Int? = null)
