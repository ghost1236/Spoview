package kr.smiling.sportshub.external.football

import kr.smiling.sportshub.external.football.dto.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

@Component
class FootballDataOrgClient(
    @Value("\${sportshub.football-data.api-key:}") private val apiKey: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val webClient = WebClient.builder()
        .baseUrl("https://api.football-data.org/v4")
        .defaultHeader("X-Auth-Token", apiKey)
        .build()

    // 대회 코드 매핑
    companion object {
        val LEAGUE_CODE_MAP = mapOf(
            "epl" to "PL",
            "laliga" to "PD",
            "bundesliga" to "BL1",
            "seriea" to "SA",
            "ligue1" to "FL1"
        )
    }

    suspend fun getStandings(competitionCode: String): FdStandingsResponse {
        log.info("football-data.org: GET /competitions/{}/standings", competitionCode)
        return webClient.get()
            .uri("/competitions/{code}/standings", competitionCode)
            .retrieve()
            .awaitBody()
    }

    suspend fun getMatches(competitionCode: String, dateFrom: String, dateTo: String): FdMatchesResponse {
        log.info("football-data.org: GET /competitions/{}/matches from={} to={}", competitionCode, dateFrom, dateTo)
        return webClient.get()
            .uri("/competitions/{code}/matches?dateFrom={from}&dateTo={to}", competitionCode, dateFrom, dateTo)
            .retrieve()
            .awaitBody()
    }

    suspend fun getMatchesByStatus(competitionCode: String, status: String): FdMatchesResponse {
        log.info("football-data.org: GET /competitions/{}/matches status={}", competitionCode, status)
        return webClient.get()
            .uri("/competitions/{code}/matches?status={status}", competitionCode, status)
            .retrieve()
            .awaitBody()
    }

    suspend fun getTeams(competitionCode: String): FdTeamsResponse {
        log.info("football-data.org: GET /competitions/{}/teams", competitionCode)
        return webClient.get()
            .uri("/competitions/{code}/teams", competitionCode)
            .retrieve()
            .awaitBody()
    }
}
