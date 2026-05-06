package kr.smiling.sportshub.scheduler

import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.match.*
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.external.kbo.KboCrawler
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Component
class KboDataScheduler(
    private val kboCrawler: KboCrawler,
    private val leagueRepository: LeagueRepository,
    private val teamRepository: TeamRepository,
    private val standingRepository: StandingRepository,
    private val matchRepository: MatchRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val teamNameMap = mapOf(
        "SSG" to "ssg", "KIA" to "kia", "LG" to "lgd",
        "두산" to "doo", "KT" to "ktu", "삼성" to "sam",
        "롯데" to "lot", "한화" to "han", "NC" to "nc",
        "키움" to "kw"
    )

    private fun findTeamCode(name: String): String? {
        return teamNameMap.entries.find { name.trim().startsWith(it.key) || name.trim() == it.key }?.value
    }

    @Scheduled(cron = "0 25 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectStandings() {
        log.info("=== KBO 순위 수집 시작 ===")
        val kboLeague = leagueRepository.findByLeagueCode("kbo") ?: return

        val rows = kboCrawler.crawlStandings()
        for (row in rows) {
            val teamCode = teamNameMap.entries.find { row.teamName.contains(it.key) }?.value
            if (teamCode == null) { log.warn("KBO 팀명 매핑 실패: {}", row.teamName); continue }

            val team = teamRepository.findByTeamCode(teamCode) ?: continue
            val existing = standingRepository.findByLeague_LeagueCodeAndTeam_TeamCodeAndSeasonYear(
                "kbo", teamCode, kboLeague.seasonYear
            )

            if (existing != null) {
                existing.rankPosition = row.rank; existing.played = row.played
                existing.won = row.won; existing.lost = row.lost; existing.drawn = row.drawn
                existing.winningPct = row.winningPct; existing.gamesBack = row.gamesBack
                existing.updatedAt = LocalDateTime.now()
            } else {
                standingRepository.save(Standing(
                    league = kboLeague, team = team, seasonYear = kboLeague.seasonYear,
                    rankPosition = row.rank, played = row.played,
                    won = row.won, drawn = row.drawn, lost = row.lost,
                    winningPct = row.winningPct, gamesBack = row.gamesBack
                ))
            }
        }
        log.info("=== KBO 순위 수집 완료: {}팀 ===", rows.size)
    }

    /**
     * KBO 경기 일정 수집
     * 공식 API: POST koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule
     */
    @Scheduled(cron = "0 30 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectMatches() {
        log.info("=== KBO 경기 일정 수집 시작 ===")
        val kboLeague = leagueRepository.findByLeagueCode("kbo") ?: return
        val year = LocalDate.now().year
        var totalCount = 0

        for (month in 3..11) {
            try {
                val formData = "leId=1&srIdList=0%2C9&date=${year}${String.format("%02d", month)}01&seasonId=$year&gameMonth=${String.format("%02d", month)}"
                val json = fetchFormPost("https://www.koreabaseball.com/ws/Schedule.asmx/GetMonthSchedule", formData)

                val gson = com.google.gson.Gson()
                val response = gson.fromJson(json, Map::class.java) as Map<String, Any>
                val rows = response["rows"] as? List<Map<String, Any>> ?: continue

                for (row in rows) {
                    val cells = row["row"] as? List<Map<String, Any>> ?: continue
                    for (cell in cells) {
                        val text = cell["Text"] as? String ?: continue
                        totalCount += parseKboCell(text, year, month, kboLeague)
                    }
                }
            } catch (e: Exception) {
                log.debug("KBO {}월 파싱 실패: {}", month, e.message)
            }
        }
        log.info("=== KBO 경기 일정 수집 완료: {}경기 ===", totalCount)
    }

    private fun parseKboCell(html: String, year: Int, month: Int, kboLeague: kr.smiling.sportshub.domain.team.League): Int {
        var count = 0
        // 날짜 추출
        val dayMatch = Regex("""class="dayNum"[^>]*>(\d+)""").find(html) ?: return 0
        val day = dayMatch.groupValues[1].toIntOrNull() ?: return 0

        // 종료 경기: <a href='...gameDate=20260501&gameId=...'>팀 <b>점수 : 점수</b> 팀</a>
        val finishedPattern = Regex("""gameDate=(\d+)&gameId=([^&']+)[^>]*><li>([^<]+)<b>(\d+)\s*:\s*(\d+)</b>\s*([^<]+)""")
        for (m in finishedPattern.findAll(html)) {
            val gameId = m.groupValues[2]
            val awayName = m.groupValues[3].trim()
            val awayScore = m.groupValues[4].toIntOrNull() ?: 0
            val homeScore = m.groupValues[5].toIntOrNull() ?: 0
            val homeName = m.groupValues[6].trim()

            val awayCode = findTeamCode(awayName) ?: continue
            val homeCode = findTeamCode(homeName) ?: continue
            val awayTeam = teamRepository.findByTeamCode(awayCode) ?: continue
            val homeTeam = teamRepository.findByTeamCode(homeCode) ?: continue

            val matchDate = try { LocalDate.of(year, month, day).atStartOfDay() } catch (e: Exception) { continue }
            val apiMatchId = "kbo_$gameId"

            val existing = matchRepository.findByApiMatchId(apiMatchId)
            if (existing != null) {
                existing.homeScore = homeScore; existing.awayScore = awayScore; existing.status = MatchStatus.FINISHED
            } else {
                matchRepository.save(Match(
                    league = kboLeague, sportType = SportType.BASEBALL,
                    homeTeam = homeTeam, awayTeam = awayTeam, matchDate = matchDate,
                    homeScore = homeScore, awayScore = awayScore, status = MatchStatus.FINISHED,
                    apiMatchId = apiMatchId
                ))
            }
            count++
        }

        // 예정 경기: <li>팀 : 팀 [구장]</li>
        val scheduledPattern = Regex("""<li>([가-힣A-Z]+)\s*:\s*([가-힣A-Z]+)\s*\[([^\]]*)\]</li>""")
        for (m in scheduledPattern.findAll(html)) {
            val awayName = m.groupValues[1].trim()
            val homeName = m.groupValues[2].trim()
            val stadium = m.groupValues[3].trim()

            val awayCode = findTeamCode(awayName) ?: continue
            val homeCode = findTeamCode(homeName) ?: continue
            val awayTeam = teamRepository.findByTeamCode(awayCode) ?: continue
            val homeTeam = teamRepository.findByTeamCode(homeCode) ?: continue

            val matchDate = try { LocalDate.of(year, month, day).atTime(LocalTime.of(18, 30)) } catch (e: Exception) { continue }
            val apiMatchId = "kbo_${year}${String.format("%02d", month)}${String.format("%02d", day)}_${awayCode}_${homeCode}"

            if (matchRepository.findByApiMatchId(apiMatchId) == null) {
                matchRepository.save(Match(
                    league = kboLeague, sportType = SportType.BASEBALL,
                    homeTeam = homeTeam, awayTeam = awayTeam, matchDate = matchDate,
                    status = MatchStatus.SCHEDULED, venue = stadium, apiMatchId = apiMatchId
                ))
            }
            count++
        }

        return count
    }

    private fun fetchFormPost(urlStr: String, formData: String): String {
        val url = URL(urlStr)
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("User-Agent", "Mozilla/5.0")
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        conn.setRequestProperty("Accept", "application/json, */*")
        conn.connectTimeout = 10000
        conn.readTimeout = 10000
        conn.doOutput = true
        conn.outputStream.use { it.write(formData.toByteArray(Charsets.UTF_8)) }
        return conn.inputStream.bufferedReader(Charsets.UTF_8).readText()
    }
}
