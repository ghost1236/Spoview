package kr.smiling.sportshub.scheduler

import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.match.*
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.Team
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.external.football.FootballDataOrgClient
import kr.smiling.sportshub.external.football.FootballDataOrgClient.Companion.LEAGUE_CODE_MAP
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Component
class FootballDataScheduler(
    private val footballClient: FootballDataOrgClient,
    private val leagueRepository: LeagueRepository,
    private val teamRepository: TeamRepository,
    private val matchRepository: MatchRepository,
    private val standingRepository: StandingRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // football-data.org team ID → 우리 DB team 매칭 (tla 기반)
    private fun findTeamByFdId(fdTeamId: Int, leagueCode: String): Team? {
        // 먼저 api_football_id로 시도 (football-data.org ID를 같은 필드에 저장)
        return teamRepository.findByApiFootballId(fdTeamId)
            ?: teamRepository.findByLeague_LeagueCode(leagueCode).firstOrNull()
    }

    // 리그별 존(zone) 구분 — 2025-26 시즌 기준
    // 유럽 퍼포먼스 스팟(EPS): 잉글랜드/스페인 → 5위 UCL 진출 확정
    // 독일/이탈리아/프랑스 → EPS 미획득, 기본 배분
    // 국내 컵 우승팀이 상위권이면 UEL/UECL 자리가 차순위로 이관 (여기선 기본 배분 적용)
    private fun getZoneDescription(leagueCode: String, position: Int, totalTeams: Int): String? {
        return when (leagueCode) {
            // EPL: UCL 5장(EPS 확보), UEL 1장(6위), UECL 1장(7위), 강등 3팀(18-20)
            "epl" -> when (position) {
                in 1..5 -> "Champions League"
                6 -> "Europa League"
                7 -> "Europa Conference League"
                in (totalTeams - 2)..totalTeams -> "Relegation"
                else -> null
            }
            // 라리가: UCL 5장(EPS 확보), UEL 1장(6위), UECL 1장(7위), 강등 3팀(18-20)
            "laliga" -> when (position) {
                in 1..5 -> "Champions League"
                6 -> "Europa League"
                7 -> "Europa Conference League"
                in (totalTeams - 2)..totalTeams -> "Relegation"
                else -> null
            }
            // 분데스: UCL 4장, UEL 1장(5위), UECL 1장(6위), 강등PO(16위), 자동강등(17-18)
            "bundesliga" -> when (position) {
                in 1..4 -> "Champions League"
                5 -> "Europa League"
                6 -> "Europa Conference League"
                totalTeams - 2 -> "Relegation Playoff"
                in (totalTeams - 1)..totalTeams -> "Relegation"
                else -> null
            }
            // 세리에A: UCL 4장, UEL 1장(5위), UECL 1장(6위), 강등 3팀(18-20)
            "seriea" -> when (position) {
                in 1..4 -> "Champions League"
                5 -> "Europa League"
                6 -> "Europa Conference League"
                in (totalTeams - 2)..totalTeams -> "Relegation"
                else -> null
            }
            // 리그앙: UCL 3장 자동(1-3), UCL 예선(4위), UEL 1장(5위), UECL 1장(6위), 강등PO(16위), 자동강등(17-18)
            "ligue1" -> when (position) {
                in 1..3 -> "Champions League"
                4 -> "Champions League Qualifiers"
                5 -> "Europa League"
                6 -> "Europa Conference League"
                totalTeams - 2 -> "Relegation Playoff"
                in (totalTeams - 1)..totalTeams -> "Relegation"
                else -> null
            }
            else -> null
        }
    }

    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectStandings() = runBlocking {
        log.info("=== 축구 순위 수집 시작 (football-data.org) ===")
        val leagues = leagueRepository.findAllByOrderByDisplayOrder()
            .filter { it.sportType == SportType.FOOTBALL && LEAGUE_CODE_MAP.containsKey(it.leagueCode) }

        for (league in leagues) {
            val fdCode = LEAGUE_CODE_MAP[league.leagueCode] ?: continue
            try {
                val response = footballClient.getStandings(fdCode)
                val totalStandings = response.standings
                    .firstOrNull { it.type == "TOTAL" }?.table ?: continue

                val totalTeams = totalStandings.size
                var matched = 0

                // 해당 리그 팀 목록을 미리 로드
                val leagueTeams = teamRepository.findByLeague_LeagueCode(league.leagueCode)

                for (entry in totalStandings) {
                    val fdTeamId = entry.team?.id ?: continue
                    val tla = entry.team?.tla?.lowercase() ?: continue

                    // 같은 리그 내에서 tla로 매칭 (접미사 포함), 없으면 전체에서 시도
                    val team = leagueTeams.find { it.teamCode == tla }
                        ?: leagueTeams.find { it.teamCode.startsWith(tla) }  // fcb2, bre2 등
                        ?: teamRepository.findByTeamCode(tla)
                    if (team == null) {
                        log.warn("팀 매칭 실패: {} (id={}, tla={})", entry.team?.name, fdTeamId, tla)
                        continue
                    }

                    // api_football_id를 football-data.org ID로 업데이트 (최초 1회)
                    if (team.apiFootballId != fdTeamId) {
                        // JPA dirty checking으로 업데이트
                    }

                    val zone = getZoneDescription(league.leagueCode, entry.position, totalTeams)
                    val form = entry.form?.replace(",", "") // "W,W,D,L,W" → "WWDLW"

                    val existing = standingRepository.findByLeague_LeagueCodeAndTeam_TeamCodeAndSeasonYear(
                        league.leagueCode, team.teamCode, league.seasonYear
                    )

                    if (existing != null) {
                        existing.rankPosition = entry.position
                        existing.played = entry.playedGames
                        existing.won = entry.won
                        existing.drawn = entry.draw
                        existing.lost = entry.lost
                        existing.goalsFor = entry.goalsFor
                        existing.goalsAgainst = entry.goalsAgainst
                        existing.goalDiff = entry.goalDifference
                        existing.points = entry.points
                        existing.form = form
                        existing.zoneDescription = zone
                        existing.updatedAt = LocalDateTime.now()
                    } else {
                        standingRepository.save(Standing(
                            league = league,
                            team = team,
                            seasonYear = league.seasonYear,
                            rankPosition = entry.position,
                            played = entry.playedGames,
                            won = entry.won,
                            drawn = entry.draw,
                            lost = entry.lost,
                            goalsFor = entry.goalsFor,
                            goalsAgainst = entry.goalsAgainst,
                            goalDiff = entry.goalDifference,
                            points = entry.points,
                            form = form,
                            zoneDescription = zone
                        ))
                    }
                    matched++
                }
                log.info("순위 수집 완료: {} ({}/{}팀 매칭)", league.nameKo, matched, totalTeams)
                delay(6500) // 10 req/min → 6초 간격
            } catch (e: Exception) {
                log.error("순위 수집 실패: {} - {}", league.nameKo, e.message)
            }
        }
        log.info("=== 축구 순위 수집 완료 ===")
    }

    @Scheduled(cron = "0 5 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectTodayFixtures() = runBlocking {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val tomorrow = LocalDate.now().plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        log.info("=== 오늘/내일 경기 수집: {} ~ {} ===", today, tomorrow)
        collectFixturesForRange(today, tomorrow)
    }

    @Scheduled(cron = "0 10 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectYesterdayResults() = runBlocking {
        val yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        log.info("=== 전일 결과 수집: {} ===", yesterday)
        collectFixturesForRange(yesterday, yesterday)
    }

    @Transactional
    fun collectFixturesRange(dateFrom: String, dateTo: String) = runBlocking {
        log.info("=== 축구 경기 범위 수집: {} ~ {} ===", dateFrom, dateTo)
        collectFixturesForRange(dateFrom, dateTo)
    }

    private suspend fun collectFixturesForRange(dateFrom: String, dateTo: String) {
        val leagues = leagueRepository.findAllByOrderByDisplayOrder()
            .filter { it.sportType == SportType.FOOTBALL && LEAGUE_CODE_MAP.containsKey(it.leagueCode) }

        for (league in leagues) {
            val fdCode = LEAGUE_CODE_MAP[league.leagueCode] ?: continue
            try {
                val response = footballClient.getMatches(fdCode, dateFrom, dateTo)
                for (match in response.matches) {
                    val matchId = match.id.toString()
                    val homeTla = match.homeTeam?.tla?.lowercase() ?: continue
                    val awayTla = match.awayTeam?.tla?.lowercase() ?: continue
                    val homeTeam = teamRepository.findByTeamCode(homeTla) ?: continue
                    val awayTeam = teamRepository.findByTeamCode(awayTla) ?: continue

                    val matchDate = LocalDateTime.parse(
                        match.utcDate.substring(0, 19),
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME
                    )
                    val status = mapFdStatus(match.status)

                    val existing = matchRepository.findByApiMatchId(matchId)
                    if (existing != null) {
                        existing.homeScore = match.score?.fullTime?.home
                        existing.awayScore = match.score?.fullTime?.away
                        existing.status = status
                        existing.matchDate = matchDate
                    } else {
                        matchRepository.save(Match(
                            league = league,
                            sportType = SportType.FOOTBALL,
                            homeTeam = homeTeam,
                            awayTeam = awayTeam,
                            matchDate = matchDate,
                            homeScore = match.score?.fullTime?.home,
                            awayScore = match.score?.fullTime?.away,
                            status = status,
                            round = match.matchday?.let { "Matchday $it" },
                            venue = match.venue,
                            apiMatchId = matchId
                        ))
                    }
                }
                log.info("경기 수집 완료: {} ({}경기)", league.nameKo, response.matches.size)
                delay(6500)
            } catch (e: Exception) {
                log.error("경기 수집 실패: {} - {}", league.nameKo, e.message)
            }
        }
    }

    private fun mapFdStatus(status: String): MatchStatus = when (status) {
        "SCHEDULED", "TIMED" -> MatchStatus.SCHEDULED
        "IN_PLAY", "PAUSED" -> MatchStatus.LIVE
        "FINISHED" -> MatchStatus.FINISHED
        "POSTPONED" -> MatchStatus.POSTPONED
        "SUSPENDED", "CANCELLED", "AWARDED" -> MatchStatus.CANCELLED
        else -> MatchStatus.SCHEDULED
    }
}
