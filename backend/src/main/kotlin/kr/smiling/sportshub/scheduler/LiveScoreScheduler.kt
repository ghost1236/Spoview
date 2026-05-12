// ============================================
// LiveScoreScheduler.kt
// 실시간 경기 스코어를 자동으로 업데이트하는 스케줄러예요
//
// 역할:
//   - 축구: 5분마다 진행 중인 경기(LIVE)의 스코어를 football-data.org에서 가져와요
//   - 야구: 30초마다 진행 중인 MLB 경기 스코어를 MLB Stats API에서 가져와요
//   - 1분마다 예정(SCHEDULED) 상태인데 경기 시작 시간이 지난 경기를 감지해서 LIVE로 전환해요
//
// 알림:
//   - 경기가 시작되면 해당 팀 구독자에게 "경기 시작" 알림을 보내요
//   - 경기가 끝나면 해당 팀 구독자에게 "결과" 알림을 보내요
//
// 참고:
//   - KBO / K리그는 실시간 폴링 없이 데일리 스케줄러(KboDataScheduler, KLeagueDataScheduler)만 사용해요
//   - football-data.org는 API 요청 횟수 제한이 있어서 라이브 경기가 없으면 요청하지 않아요
// ============================================

package kr.smiling.sportshub.scheduler

import kotlinx.coroutines.runBlocking
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.match.Match
import kr.smiling.sportshub.domain.match.MatchRepository
import kr.smiling.sportshub.domain.match.MatchStatus
import kr.smiling.sportshub.domain.community.NotificationType
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.external.football.FootballDataOrgClient
import kr.smiling.sportshub.external.football.FootballDataOrgClient.Companion.LEAGUE_CODE_MAP
import kr.smiling.sportshub.external.mlb.MlbStatsClient
import kr.smiling.sportshub.service.NotificationService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Component
class LiveScoreScheduler(
    private val matchRepository: MatchRepository,
    private val leagueRepository: LeagueRepository,
    private val teamRepository: TeamRepository,
    private val footballClient: FootballDataOrgClient,
    private val mlbStatsClient: MlbStatsClient,
    private val notificationService: NotificationService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // ============================================
    // 1. 라이브 축구 스코어 폴링
    // 5분(300,000ms)마다 실행돼요
    // LIVE 상태인 축구 경기의 스코어를 football-data.org에서 가져와요
    // ============================================
    @Scheduled(fixedRate = 300_000)
    @Transactional
    fun pollLiveFootball() = runBlocking {
        // DB에서 현재 LIVE 상태인 축구 경기만 가져와요
        val liveMatches = matchRepository.findByStatusOrderByMatchDate(MatchStatus.LIVE)
            .filter { it.sportType == SportType.FOOTBALL }

        // LIVE 경기가 없으면 불필요한 API 호출을 하지 않아요 (API 요청 아끼기)
        if (liveMatches.isEmpty()) {
            log.debug("폴링 스킵: LIVE 상태인 축구 경기 없음")
            return@runBlocking
        }

        log.info("=== 라이브 축구 스코어 폴링 시작: {}경기 ===", liveMatches.size)

        // football-data.org는 리그 단위로 조회해요
        // 같은 리그 경기끼리 묶어서 API 요청 횟수를 줄여요
        val matchesByLeague = liveMatches.groupBy { it.league.leagueCode }

        for ((leagueCode, matches) in matchesByLeague) {
            // 우리 리그 코드(예: "epl")를 football-data.org 코드(예: "PL")로 변환해요
            // LEAGUE_CODE_MAP에 없는 리그(K리그 등)는 스킵해요
            val fdCode = LEAGUE_CODE_MAP[leagueCode]
            if (fdCode == null) {
                log.debug("football-data.org 코드 없음: {}", leagueCode)
                continue
            }

            try {
                // football-data.org에서 현재 IN_PLAY 중인 경기 목록을 가져와요
                val response = footballClient.getMatchesByStatus(fdCode, "IN_PLAY,PAUSED")

                // API 응답에서 각 경기를 우리 DB 경기와 매칭해서 스코어를 업데이트해요
                for (apiMatch in response.matches) {
                    val matchId = apiMatch.id.toString()

                    // API에서 받은 경기 ID로 우리 DB에서 해당 경기를 찾아요
                    val dbMatch = matchRepository.findByApiMatchId(matchId) ?: continue

                    val newHomeScore = apiMatch.score?.fullTime?.home
                    val newAwayScore = apiMatch.score?.fullTime?.away
                    val newStatus = mapFdStatus(apiMatch.status)

                    // 스코어나 상태가 바뀐 경우에만 DB를 업데이트해요 (불필요한 쓰기 줄이기)
                    if (dbMatch.homeScore != newHomeScore || dbMatch.awayScore != newAwayScore || dbMatch.status != newStatus) {
                        val previousStatus = dbMatch.status

                        dbMatch.homeScore = newHomeScore
                        dbMatch.awayScore = newAwayScore
                        dbMatch.status = newStatus

                        log.info(
                            "축구 스코어 업데이트: {} {} vs {} {} {} → {} ({}:{})",
                            leagueCode,
                            dbMatch.homeTeam.nameKo,
                            dbMatch.awayTeam.nameKo,
                            previousStatus,
                            newStatus,
                            newHomeScore,
                            newAwayScore
                        )

                        // 경기가 끝난 경우(FINISHED) → 결과 알림 발송
                        if (previousStatus == MatchStatus.LIVE && newStatus == MatchStatus.FINISHED) {
                            notifyMatchFinished(dbMatch)
                        }
                    }
                }

                // football-data.org에서 IN_PLAY로 잡히지 않은 경기(= LIVE였는데 응답에 없는 경기)
                // 를 처리해요. API가 가끔 경기 상태 전환을 늦게 반영하는 경우를 방어해요
                val apiMatchIds = response.matches.map { it.id.toString() }.toSet()
                for (dbMatch in matches) {
                    val matchId = dbMatch.apiMatchId ?: continue
                    if (matchId !in apiMatchIds) {
                        // 오늘 날짜 기준으로 경기 종료 여부를 재확인 (API에서 사라진 경기)
                        // → 다음 폴링 주기에서 detectNewLiveMatches()가 처리하므로 여기선 로그만 남겨요
                        log.debug("LIVE 경기가 API 응답에 없음 (종료 가능성): matchId={}", matchId)
                    }
                }

            } catch (e: Exception) {
                // 한 리그 실패가 다른 리그 폴링을 막지 않도록 예외를 잡아요
                log.error("라이브 축구 스코어 폴링 실패: {} - {}", leagueCode, e.message)
            }
        }

        log.info("=== 라이브 축구 스코어 폴링 완료 ===")
    }

    // ============================================
    // 2. 라이브 MLB 스코어 폴링
    // 30초(30,000ms)마다 실행돼요
    // MLB Stats API는 요청 제한이 없어서 더 자주 폴링할 수 있어요
    // ============================================
    @Scheduled(fixedRate = 30_000)
    @Transactional
    fun pollLiveMlb() = runBlocking {
        // DB에서 현재 LIVE 상태인 MLB(야구) 경기만 가져와요
        val liveMatches = matchRepository.findByStatusOrderByMatchDate(MatchStatus.LIVE)
            .filter { it.sportType == SportType.BASEBALL }

        // LIVE 경기가 없으면 오늘 날짜로 조회하지 않아요
        if (liveMatches.isEmpty()) {
            log.debug("폴링 스킵: LIVE 상태인 MLB 경기 없음")
            return@runBlocking
        }

        log.info("=== 라이브 MLB 스코어 폴링 시작: {}경기 ===", liveMatches.size)

        // MLB Stats API는 날짜 단위로 조회해요 → 오늘 날짜로 요청
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

        try {
            val response = mlbStatsClient.getSchedule(today)

            // API 응답에서 각 경기를 우리 DB 경기와 매칭해서 스코어를 업데이트해요
            for (scheduleDate in response.dates) {
                for (apiGame in scheduleDate.games) {
                    val gamePk = apiGame.gamePk.toString()

                    // API에서 받은 gamePk로 우리 DB에서 해당 경기를 찾아요
                    val dbMatch = matchRepository.findByApiMatchId(gamePk) ?: continue

                    val newHomeScore = apiGame.teams?.home?.score
                    val newAwayScore = apiGame.teams?.away?.score
                    val newStatus = mapMlbStatus(apiGame.status?.abstractGameState ?: "Preview")

                    // 스코어나 상태가 바뀐 경우에만 DB를 업데이트해요
                    if (dbMatch.homeScore != newHomeScore || dbMatch.awayScore != newAwayScore || dbMatch.status != newStatus) {
                        val previousStatus = dbMatch.status

                        dbMatch.homeScore = newHomeScore
                        dbMatch.awayScore = newAwayScore
                        dbMatch.status = newStatus

                        log.info(
                            "MLB 스코어 업데이트: {} vs {} {} → {} ({}:{})",
                            dbMatch.homeTeam.nameKo,
                            dbMatch.awayTeam.nameKo,
                            previousStatus,
                            newStatus,
                            newHomeScore,
                            newAwayScore
                        )

                        // 경기가 끝난 경우(FINISHED) → 결과 알림 발송
                        if (previousStatus == MatchStatus.LIVE && newStatus == MatchStatus.FINISHED) {
                            notifyMatchFinished(dbMatch)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            log.error("라이브 MLB 스코어 폴링 실패: {}", e.message)
        }

        log.info("=== 라이브 MLB 스코어 폴링 완료 ===")
    }

    // ============================================
    // 3. 새로 시작된 경기 감지
    // 1분(60,000ms)마다 실행돼요
    //
    // 동작 방식:
    //   SCHEDULED(예정) 상태인데 경기 시작 시간이 이미 지난 경기를 찾아서
    //   실제로 시작됐는지 API를 통해 확인하고 LIVE로 전환해요
    //   전환되면 해당 팀 구독자에게 "경기 시작" 알림을 보내요
    // ============================================
    @Scheduled(fixedRate = 60_000)
    @Transactional
    fun detectNewLiveMatches() = runBlocking {
        // 지금 시각 기준으로 경기 시작 시간이 10분~3시간 지난 SCHEDULED 경기를 찾아요
        // (너무 먼 미래 경기는 아직 시작 안 한 것이고, 10분은 API 반영 지연 여유를 줘요)
        val now = LocalDateTime.now()
        val windowStart = now.minusHours(3)  // 3시간 이상 지난 건 이미 처리됐어야 해요
        val windowEnd = now.minusMinutes(10) // 10분 여유를 줘요 (API 반영 지연 대비)

        // SCHEDULED 상태인 경기 중에서 경기 시작 시간이 해당 범위에 있는 것을 찾아요
        val candidateMatches = matchRepository.findByStatusOrderByMatchDate(MatchStatus.SCHEDULED)
            .filter { it.matchDate in windowStart..windowEnd }

        // 대상 경기가 없으면 API 호출 없이 종료
        if (candidateMatches.isEmpty()) {
            log.debug("감지 스킵: LIVE 전환 후보 경기 없음")
            return@runBlocking
        }

        log.info("=== 라이브 전환 감지 시작: {}경기 후보 ===", candidateMatches.size)

        // 축구 경기와 야구 경기를 따로 처리해요
        val footballCandidates = candidateMatches.filter { it.sportType == SportType.FOOTBALL }
        val baseballCandidates = candidateMatches.filter { it.sportType == SportType.BASEBALL }

        // 축구 경기 라이브 전환 확인
        if (footballCandidates.isNotEmpty()) {
            detectNewLiveFootball(footballCandidates)
        }

        // 야구(MLB) 경기 라이브 전환 확인
        if (baseballCandidates.isNotEmpty()) {
            detectNewLiveMlb(baseballCandidates)
        }

        log.info("=== 라이브 전환 감지 완료 ===")
    }

    // ──────────────────────────────────────────
    // 내부 헬퍼 함수들
    // ──────────────────────────────────────────

    /**
     * 축구 후보 경기들을 football-data.org API로 확인해서 LIVE로 전환해요
     * 리그별로 묶어서 API 요청을 최소화해요
     */
    private suspend fun detectNewLiveFootball(candidates: List<Match>) {
        // 같은 리그 경기끼리 묶어서 API 요청 횟수를 줄여요
        val matchesByLeague = candidates.groupBy { it.league.leagueCode }

        for ((leagueCode, matches) in matchesByLeague) {
            val fdCode = LEAGUE_CODE_MAP[leagueCode] ?: continue

            try {
                // 오늘 날짜 기준으로 IN_PLAY 경기를 가져와요
                val response = footballClient.getMatchesByStatus(fdCode, "IN_PLAY,PAUSED")

                // API에서 진행 중인 경기 ID 집합을 만들어요
                val liveApiMatchIds = response.matches
                    .filter { it.status == "IN_PLAY" || it.status == "PAUSED" }
                    .map { it.id.toString() }
                    .toSet()

                for (dbMatch in matches) {
                    val matchId = dbMatch.apiMatchId ?: continue

                    // 우리 DB의 SCHEDULED 경기가 API에서 IN_PLAY로 나오면 LIVE로 전환해요
                    if (matchId in liveApiMatchIds) {
                        val apiMatch = response.matches.find { it.id.toString() == matchId }

                        dbMatch.status = MatchStatus.LIVE
                        dbMatch.homeScore = apiMatch?.score?.fullTime?.home
                        dbMatch.awayScore = apiMatch?.score?.fullTime?.away

                        log.info(
                            "축구 경기 LIVE 전환: {} {} vs {}",
                            leagueCode,
                            dbMatch.homeTeam.nameKo,
                            dbMatch.awayTeam.nameKo
                        )

                        // 경기 시작 알림을 양 팀 구독자에게 보내요
                        notifyMatchStarted(dbMatch)
                    }
                }
            } catch (e: Exception) {
                log.error("축구 라이브 전환 감지 실패: {} - {}", leagueCode, e.message)
            }
        }
    }

    /**
     * MLB 후보 경기들을 MLB Stats API로 확인해서 LIVE로 전환해요
     * 날짜 기준으로 한 번만 API를 호출해요 (MLB API는 날짜 단위 조회)
     */
    private suspend fun detectNewLiveMlb(candidates: List<Match>) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

        try {
            val response = mlbStatsClient.getSchedule(today)

            // API 응답에서 진행 중인 경기를 gamePk → 상태/스코어 형태로 매핑해요
            val liveGamesMap = response.dates
                .flatMap { it.games }
                .filter { it.status?.abstractGameState == "Live" }
                .associateBy { it.gamePk.toString() }

            for (dbMatch in candidates) {
                val gamePk = dbMatch.apiMatchId ?: continue

                // 우리 DB의 SCHEDULED 경기가 API에서 "Live"로 나오면 LIVE로 전환해요
                val liveGame = liveGamesMap[gamePk] ?: continue

                dbMatch.status = MatchStatus.LIVE
                dbMatch.homeScore = liveGame.teams?.home?.score
                dbMatch.awayScore = liveGame.teams?.away?.score

                log.info(
                    "MLB 경기 LIVE 전환: {} vs {}",
                    dbMatch.homeTeam.nameKo,
                    dbMatch.awayTeam.nameKo
                )

                // 경기 시작 알림을 양 팀 구독자에게 보내요
                notifyMatchStarted(dbMatch)
            }
        } catch (e: Exception) {
            log.error("MLB 라이브 전환 감지 실패: {}", e.message)
        }
    }

    /**
     * 경기 시작 알림을 홈/어웨이 팀 구독자 모두에게 보내요
     *
     * 예시 알림: "[EPL] 맨시티 vs 아스널 경기가 시작됐어요!"
     */
    private fun notifyMatchStarted(match: Match) {
        val leagueName = match.league.nameKo
        val homeTeamName = match.homeTeam.nameKo
        val awayTeamName = match.awayTeam.nameKo

        val title = "[$leagueName] 경기 시작!"
        val body = "$homeTeamName vs $awayTeamName 경기가 시작됐어요!"

        // 홈 팀 구독자에게 알림
        try {
            notificationService.notifyTeamSubscribers(
                teamCode = match.homeTeam.teamCode,
                type = NotificationType.MATCH_START,
                title = title,
                body = body
            )
        } catch (e: Exception) {
            log.warn("홈 팀 시작 알림 실패: teamCode={} - {}", match.homeTeam.teamCode, e.message)
        }

        // 어웨이 팀 구독자에게 알림
        try {
            notificationService.notifyTeamSubscribers(
                teamCode = match.awayTeam.teamCode,
                type = NotificationType.MATCH_START,
                title = title,
                body = body
            )
        } catch (e: Exception) {
            log.warn("어웨이 팀 시작 알림 실패: teamCode={} - {}", match.awayTeam.teamCode, e.message)
        }
    }

    /**
     * 경기 종료 알림을 홈/어웨이 팀 구독자 모두에게 보내요
     * 최종 스코어를 알림 내용에 포함해요
     *
     * 예시 알림: "[EPL] 맨시티 2 - 1 아스널 경기가 종료됐어요"
     */
    private fun notifyMatchFinished(match: Match) {
        val leagueName = match.league.nameKo
        val homeTeamName = match.homeTeam.nameKo
        val awayTeamName = match.awayTeam.nameKo

        // 스코어가 없는 경우(데이터 지연)는 ?로 표시해요
        val homeScore = match.homeScore?.toString() ?: "?"
        val awayScore = match.awayScore?.toString() ?: "?"

        val title = "[$leagueName] 경기 종료"
        val body = "$homeTeamName $homeScore : $awayScore $awayTeamName"

        // 홈 팀 구독자에게 알림
        try {
            notificationService.notifyTeamSubscribers(
                teamCode = match.homeTeam.teamCode,
                type = NotificationType.RESULT,
                title = title,
                body = body
            )
        } catch (e: Exception) {
            log.warn("홈 팀 종료 알림 실패: teamCode={} - {}", match.homeTeam.teamCode, e.message)
        }

        // 어웨이 팀 구독자에게 알림
        try {
            notificationService.notifyTeamSubscribers(
                teamCode = match.awayTeam.teamCode,
                type = NotificationType.RESULT,
                title = title,
                body = body
            )
        } catch (e: Exception) {
            log.warn("어웨이 팀 종료 알림 실패: teamCode={} - {}", match.awayTeam.teamCode, e.message)
        }
    }

    /**
     * football-data.org의 경기 상태 문자열을 우리 MatchStatus enum으로 변환해요
     *
     * football-data.org 상태값:
     *   SCHEDULED/TIMED → 예정됨
     *   IN_PLAY/PAUSED  → 진행 중
     *   FINISHED        → 종료
     *   POSTPONED       → 연기
     *   SUSPENDED/CANCELLED/AWARDED → 취소
     */
    private fun mapFdStatus(status: String): MatchStatus = when (status) {
        "SCHEDULED", "TIMED" -> MatchStatus.SCHEDULED
        "IN_PLAY", "PAUSED" -> MatchStatus.LIVE
        "FINISHED" -> MatchStatus.FINISHED
        "POSTPONED" -> MatchStatus.POSTPONED
        "SUSPENDED", "CANCELLED", "AWARDED" -> MatchStatus.CANCELLED
        else -> MatchStatus.SCHEDULED
    }

    /**
     * MLB Stats API의 경기 상태 문자열을 우리 MatchStatus enum으로 변환해요
     *
     * MLB abstractGameState 값:
     *   Preview → 경기 전(예정)
     *   Live    → 진행 중
     *   Final   → 종료
     */
    private fun mapMlbStatus(state: String): MatchStatus = when (state) {
        "Preview" -> MatchStatus.SCHEDULED
        "Live" -> MatchStatus.LIVE
        "Final" -> MatchStatus.FINISHED
        else -> MatchStatus.SCHEDULED
    }
}
