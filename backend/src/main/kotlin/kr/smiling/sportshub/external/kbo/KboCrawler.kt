package kr.smiling.sportshub.external.kbo

import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

data class KboStandingRow(
    val rank: Int,
    val teamName: String,
    val played: Int,
    val won: Int,
    val lost: Int,
    val drawn: Int,
    val winningPct: String,
    val gamesBack: String
)

@Component
class KboCrawler {
    private val log = LoggerFactory.getLogger(javaClass)

    fun crawlStandings(): List<KboStandingRow> {
        log.info("KBO 순위 크롤링 시작")
        return try {
            val doc = Jsoup.connect("https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .timeout(10000)
                .get()

            val rows = doc.select(".tData tbody tr")
            rows.mapNotNull { row ->
                val cells = row.select("td")
                if (cells.size < 8) return@mapNotNull null

                KboStandingRow(
                    rank = cells[0].text().trim().toIntOrNull() ?: 0,
                    teamName = cells[1].text().trim(),
                    played = cells[2].text().trim().toIntOrNull() ?: 0,
                    won = cells[3].text().trim().toIntOrNull() ?: 0,
                    lost = cells[4].text().trim().toIntOrNull() ?: 0,
                    drawn = cells[5].text().trim().toIntOrNull() ?: 0,
                    winningPct = cells[6].text().trim(),
                    gamesBack = cells[7].text().trim()
                )
            }.also { log.info("KBO 순위 크롤링 완료: {}팀", it.size) }
        } catch (e: Exception) {
            log.error("KBO 순위 크롤링 실패: {}", e.message)
            emptyList()
        }
    }
}
