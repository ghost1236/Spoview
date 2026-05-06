package kr.smiling.sportshub.scheduler

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import kotlinx.coroutines.runBlocking
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.match.*
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.TeamRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Component
class KLeagueDataScheduler(
    private val leagueRepository: LeagueRepository,
    private val teamRepository: TeamRepository,
    private val standingRepository: StandingRepository,
    private val matchRepository: MatchRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val webClient = WebClient.builder()
        .baseUrl("https://www.kleague.com")
        .defaultHeader("User-Agent", "Mozilla/5.0")
        .defaultHeader("Content-Type", "application/json")
        .defaultHeader("Accept", "application/json, */*")
        .build()

    // K리그 팀명 → team_code 매핑
    private val teamNameMap = mapOf(
        "서울" to "fcs", "전북" to "jun", "울산" to "usn", "강원" to "gnm",
        "대전" to "dae", "포항" to "phn", "안양" to "ann", "인천" to "inc",
        "제주" to "jej", "김천" to "gsn", "부천" to "buc", "광주" to "gjn",
        "대구" to "dgu", "수원FC" to "suw", "수원" to "swb",
        "이랜드" to "sej", "서울E" to "sej", "성남" to "sgn",
        "전남" to "jnm", "김포" to "gyg", "부산" to "bus",
        "아산" to "cha", "충남" to "cha", "화성" to "hws",
        "청주" to "chb", "충북" to "chb", "천안" to "chn",
        "안산" to "ans", "경남" to "gyn", "김해" to "kmh",
        "용인" to "yng", "파주" to "paj"
    )

    private fun findTeamCode(name: String?): String? {
        if (name == null) return null
        return teamNameMap.entries.find { name.contains(it.key) }?.value
    }

    // ─── 순위 수집 ───

    @Scheduled(cron = "0 15 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectStandings() = runBlocking {
        // leagueId=1 → K리그1, leagueId=2 → K리그2
        for ((kleagueId, leagueCode) in listOf(1 to "kleague1", 2 to "kleague2")) {
            try {
                log.info("=== {} 순위 수집 ===", leagueCode)
                val response: KLeagueResponse = webClient.get()
                    .uri("/record/teamRank.do?leagueId={id}", kleagueId)
                    .retrieve()
                    .awaitBody()

                val league = leagueRepository.findByLeagueCode(leagueCode) ?: continue
                var matched = 0

                for (entry in response.data?.teamRank ?: emptyList()) {
                    val teamCode = findTeamCode(entry.teamName) ?: continue
                    val team = teamRepository.findByTeamCode(teamCode) ?: continue

                    val form = listOfNotNull(
                        entry.game01, entry.game02, entry.game03, entry.game04, entry.game05, entry.game06
                    ).joinToString("") {
                        when (it) { "승" -> "W"; "무" -> "D"; "패" -> "L"; else -> "" }
                    }

                    val zone = if (leagueCode == "kleague1") {
                        when (entry.rank ?: 0) {
                            in 1..3 -> "ACL"
                            in 11..12 -> "Relegation"
                            else -> null
                        }
                    } else null

                    val existing = standingRepository.findByLeague_LeagueCodeAndTeam_TeamCodeAndSeasonYear(
                        leagueCode, teamCode, league.seasonYear
                    )

                    if (existing != null) {
                        existing.rankPosition = entry.rank ?: 0
                        existing.played = entry.gameCount ?: 0
                        existing.won = entry.winCnt ?: 0
                        existing.drawn = entry.tieCnt ?: 0
                        existing.lost = entry.lossCnt ?: 0
                        existing.goalsFor = entry.gainGoal ?: 0
                        existing.goalsAgainst = entry.lossGoal ?: 0
                        existing.goalDiff = entry.gapCnt ?: 0
                        existing.points = entry.gainPoint ?: 0
                        existing.form = form
                        existing.zoneDescription = zone
                        existing.updatedAt = LocalDateTime.now()
                    } else {
                        standingRepository.save(Standing(
                            league = league, team = team, seasonYear = league.seasonYear,
                            rankPosition = entry.rank ?: 0, played = entry.gameCount ?: 0,
                            won = entry.winCnt ?: 0, drawn = entry.tieCnt ?: 0, lost = entry.lossCnt ?: 0,
                            goalsFor = entry.gainGoal ?: 0, goalsAgainst = entry.lossGoal ?: 0,
                            goalDiff = entry.gapCnt ?: 0, points = entry.gainPoint ?: 0,
                            form = form, zoneDescription = zone
                        ))
                    }
                    matched++
                }
                log.info("{} 순위 완료: {}팀", leagueCode, matched)
            } catch (e: Exception) {
                log.error("{} 순위 실패: {}", leagueCode, e.message)
            }
        }
    }

    // ─── 경기 일정 수집 ───
    // K리그 공식 API: POST /getScheduleList.do
    // body: {"leagueId":1,"year":"2026","month":"05"}

    @Scheduled(cron = "0 20 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectMatches() = runBlocking {
        val year = LocalDate.now().year
        val currentMonth = LocalDate.now().monthValue

        for ((kleagueId, leagueCode) in listOf(1 to "kleague1", 2 to "kleague2")) {
            log.info("=== {} 경기 일정 수집 ===", leagueCode)
            val league = leagueRepository.findByLeagueCode(leagueCode) ?: continue
            var totalCount = 0

            for (month in 1..12) {
                try {
                    val body = """{"leagueId":$kleagueId,"year":"$year","month":"${String.format("%02d", month)}"}"""
                    val json = webClient.post()
                        .uri("/getScheduleList.do")
                        .bodyValue(body)
                        .retrieve()
                        .awaitBody<String>()

                    val gson = com.google.gson.Gson()
                    val response = gson.fromJson(json, Map::class.java) as Map<String, Any>
                    val dataMap = response["data"] as? Map<String, Any> ?: continue
                    val schedules = dataMap["scheduleList"] as? List<Map<String, Any>> ?: continue

                    for (s in schedules) {
                        val homeName = s["homeTeamName"] as? String ?: continue
                        val awayName = s["awayTeamName"] as? String ?: continue
                        val homeCode = findTeamCode(homeName) ?: continue
                        val awayCode = findTeamCode(awayName) ?: continue
                        val homeTeam = teamRepository.findByTeamCode(homeCode) ?: continue
                        val awayTeam = teamRepository.findByTeamCode(awayCode) ?: continue

                        val gameDateStr = s["gameDate"] as? String ?: continue  // "2026.05.06"
                        val gameTimeStr = s["gameTime"] as? String ?: ""         // "19:00"
                        val endYn = s["endYn"] as? String ?: "N"
                        val homeGoal = (s["homeGoal"] as? Number)?.toInt() ?: 0
                        val awayGoal = (s["awayGoal"] as? Number)?.toInt() ?: 0
                        val stadium = s["fieldNameFull"] as? String ?: ""
                        val gameId = (s["gameId"] as? Number)?.toInt()?.toString() ?: ""
                        val roundStr = s["round"] as? String

                        val matchDate = try {
                            val date = LocalDate.parse(gameDateStr.replace(".", "-"))
                            val time = if (gameTimeStr.isNotEmpty()) {
                                try { LocalTime.parse(gameTimeStr, DateTimeFormatter.ofPattern("HH:mm")) }
                                catch (e: Exception) { LocalTime.of(0, 0) }
                            } else LocalTime.of(0, 0)
                            LocalDateTime.of(date, time)
                        } catch (e: Exception) { continue }

                        val status = if (endYn == "Y") MatchStatus.FINISHED else MatchStatus.SCHEDULED
                        val apiMatchId = "kl_${kleagueId}_${gameId}"

                        val existing = matchRepository.findByApiMatchId(apiMatchId)
                        if (existing != null) {
                            existing.homeScore = if (endYn == "Y") homeGoal else null
                            existing.awayScore = if (endYn == "Y") awayGoal else null
                            existing.status = status
                            existing.matchDate = matchDate
                        } else {
                            matchRepository.save(Match(
                                league = league, sportType = SportType.FOOTBALL,
                                homeTeam = homeTeam, awayTeam = awayTeam, matchDate = matchDate,
                                homeScore = if (endYn == "Y") homeGoal else null,
                                awayScore = if (endYn == "Y") awayGoal else null,
                                status = status,
                                round = roundStr?.let { "R$it" },
                                venue = stadium, apiMatchId = apiMatchId
                            ))
                        }
                        totalCount++
                    }
                } catch (e: Exception) {
                    log.debug("{} {}월 경기 파싱 실패: {}", leagueCode, month, e.message)
                }
            }
            log.info("{} 경기 일정 완료: {}경기", leagueCode, totalCount)
        }
    }
}

// ─── K리그 순위 API 응답 DTO ───

@JsonIgnoreProperties(ignoreUnknown = true)
data class KLeagueResponse(val data: KLeagueData? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class KLeagueData(val teamRank: List<KLeagueTeamRank>? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class KLeagueTeamRank(
    val rank: Int? = null,
    val teamName: String? = null,
    val gainPoint: Int? = null,
    val winCnt: Int? = null,
    val tieCnt: Int? = null,
    val lossCnt: Int? = null,
    val gapCnt: Int? = null,
    val gainGoal: Int? = null,
    val lossGoal: Int? = null,
    val gameCount: Int? = null,
    val game01: String? = null,
    val game02: String? = null,
    val game03: String? = null,
    val game04: String? = null,
    val game05: String? = null,
    val game06: String? = null
)
