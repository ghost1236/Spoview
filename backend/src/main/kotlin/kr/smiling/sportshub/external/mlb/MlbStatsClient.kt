package kr.smiling.sportshub.external.mlb

import kr.smiling.sportshub.external.mlb.dto.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

@Component
class MlbStatsClient(
    @Qualifier("mlbWebClient") private val webClient: WebClient
) {
    private val log = LoggerFactory.getLogger(javaClass)

    suspend fun getSchedule(date: String): MlbScheduleResponse {
        log.info("MLB API: GET /schedule date={}", date)
        return webClient.get()
            .uri("/schedule?sportId=1&date={date}", date)
            .retrieve()
            .awaitBody()
    }

    suspend fun getStandings(season: Int): MlbStandingsResponse {
        log.info("MLB API: GET /standings season={}", season)
        return webClient.get()
            .uri("/standings?leagueId=103,104&season={season}", season)
            .retrieve()
            .awaitBody()
    }
}
