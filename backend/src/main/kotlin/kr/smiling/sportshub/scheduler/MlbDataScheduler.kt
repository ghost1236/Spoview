package kr.smiling.sportshub.scheduler

import kotlinx.coroutines.runBlocking
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.match.*
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.external.mlb.MlbStatsClient
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Component
class MlbDataScheduler(
    private val mlbStatsClient: MlbStatsClient,
    private val leagueRepository: LeagueRepository,
    private val teamRepository: TeamRepository,
    private val matchRepository: MatchRepository,
    private val standingRepository: StandingRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectStandings() = runBlocking {
        log.info("=== MLB 순위 수집 시작 ===")
        val mlbLeague = leagueRepository.findByLeagueCode("mlb") ?: return@runBlocking

        try {
            val response = mlbStatsClient.getStandings(mlbLeague.seasonYear)
            var rank = 0

            for (record in response.records) {
                for (teamRecord in record.teamRecords) {
                    rank++
                    val team = teamRepository.findByMlbTeamId(teamRecord.team?.id ?: continue) ?: continue
                    val existing = standingRepository.findByLeague_LeagueCodeAndTeam_TeamCodeAndSeasonYear(
                        "mlb", team.teamCode, mlbLeague.seasonYear
                    )

                    val divisionRank = teamRecord.divisionRank?.toIntOrNull() ?: rank

                    if (existing != null) {
                        existing.rankPosition = divisionRank
                        existing.won = teamRecord.wins
                        existing.lost = teamRecord.losses
                        existing.played = teamRecord.wins + teamRecord.losses
                        existing.goalsFor = teamRecord.runsScored
                        existing.goalsAgainst = teamRecord.runsAllowed
                        existing.goalDiff = teamRecord.runDifferential
                        existing.winningPct = teamRecord.winningPercentage
                        existing.gamesBack = teamRecord.gamesBack
                        existing.form = teamRecord.streak?.streakCode
                        existing.division = record.division?.name
                        existing.updatedAt = LocalDateTime.now()
                    } else {
                        standingRepository.save(Standing(
                            league = mlbLeague,
                            team = team,
                            seasonYear = mlbLeague.seasonYear,
                            rankPosition = divisionRank,
                            played = teamRecord.wins + teamRecord.losses,
                            won = teamRecord.wins,
                            lost = teamRecord.losses,
                            goalsFor = teamRecord.runsScored,
                            goalsAgainst = teamRecord.runsAllowed,
                            goalDiff = teamRecord.runDifferential,
                            winningPct = teamRecord.winningPercentage,
                            gamesBack = teamRecord.gamesBack,
                            form = teamRecord.streak?.streakCode,
                            division = record.division?.name
                        ))
                    }
                }
            }
            log.info("MLB 순위 수집 완료: {}팀", rank)
        } catch (e: Exception) {
            log.error("MLB 순위 수집 실패: {}", e.message)
        }
    }

    @Scheduled(cron = "0 5 3 * * *", zone = "Asia/Seoul")
    @Transactional
    fun collectSchedule() = runBlocking {
        val mlbLeague = leagueRepository.findByLeagueCode("mlb") ?: return@runBlocking

        // 오늘 + 전일 수집
        for (dayOffset in listOf(0L, -1L)) {
            val date = LocalDate.now().plusDays(dayOffset).format(DateTimeFormatter.ISO_LOCAL_DATE)
            log.info("=== MLB 경기 수집: {} ===", date)

            try {
                val response = mlbStatsClient.getSchedule(date)
                for (scheduleDate in response.dates) {
                    for (game in scheduleDate.games) {
                        val gamePk = game.gamePk.toString()
                        val homeTeam = teamRepository.findByMlbTeamId(game.teams?.home?.team?.id ?: continue) ?: continue
                        val awayTeam = teamRepository.findByMlbTeamId(game.teams?.away?.team?.id ?: continue) ?: continue

                        val matchDate = LocalDateTime.parse(
                            game.gameDate.substring(0, 19),
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
                        )
                        val status = mapMlbStatus(game.status?.abstractGameState ?: "Preview")

                        val existing = matchRepository.findByApiMatchId(gamePk)
                        if (existing != null) {
                            existing.homeScore = game.teams?.home?.score
                            existing.awayScore = game.teams?.away?.score
                            existing.status = status
                        } else {
                            matchRepository.save(Match(
                                league = mlbLeague,
                                sportType = SportType.BASEBALL,
                                homeTeam = homeTeam,
                                awayTeam = awayTeam,
                                matchDate = matchDate,
                                homeScore = game.teams?.home?.score,
                                awayScore = game.teams?.away?.score,
                                status = status,
                                venue = game.venue?.name,
                                apiMatchId = gamePk
                            ))
                        }
                    }
                }
                log.info("MLB 경기 수집 완료: {}", date)
            } catch (e: Exception) {
                log.error("MLB 경기 수집 실패: {} - {}", date, e.message)
            }
        }
    }

    private fun mapMlbStatus(state: String): MatchStatus = when (state) {
        "Preview" -> MatchStatus.SCHEDULED
        "Live" -> MatchStatus.LIVE
        "Final" -> MatchStatus.FINISHED
        else -> MatchStatus.SCHEDULED
    }
}
