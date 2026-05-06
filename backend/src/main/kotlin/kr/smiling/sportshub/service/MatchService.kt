package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.match.MatchRepository
import kr.smiling.sportshub.domain.match.StandingRepository
import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.dto.response.MatchResponse
import kr.smiling.sportshub.dto.response.StandingResponse
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime

@Service
@Transactional(readOnly = true)
class MatchService(
    private val matchRepository: MatchRepository,
    private val standingRepository: StandingRepository,
    private val leagueRepository: LeagueRepository
) {
    fun getTeamMatches(teamCode: String, days: Int = 30): List<MatchResponse> {
        val now = LocalDate.now()
        val from = now.minusDays(days.toLong()).atStartOfDay()
        val to = now.plusDays(days.toLong()).atTime(LocalTime.MAX)
        return matchRepository.findByTeamAndDateRange(teamCode, from, to)
            .map { MatchResponse.from(it) }
    }

    fun getLeagueStandings(leagueCode: String): List<StandingResponse> {
        val league = leagueRepository.findByLeagueCode(leagueCode)
            ?: throw BusinessException(ErrorCode.LEAGUE_NOT_FOUND)
        return standingRepository.findByLeague_LeagueCodeAndSeasonYearOrderByRankPosition(
            leagueCode, league.seasonYear
        ).map { StandingResponse.from(it) }
    }

    fun getTodayMatches(): List<MatchResponse> {
        val today = LocalDate.now()
        val from = today.atStartOfDay()
        val to = today.atTime(LocalTime.MAX)
        return matchRepository.findAll().filter {
            it.matchDate.toLocalDate() == today
        }.map { MatchResponse.from(it) }
    }

    fun getMatchesByLeague(leagueCode: String, date: LocalDate): List<MatchResponse> {
        val from = date.atStartOfDay()
        val to = date.atTime(LocalTime.MAX)
        return matchRepository.findByLeague_LeagueCodeAndMatchDateBetweenOrderByMatchDate(
            leagueCode, from, to
        ).map { MatchResponse.from(it) }
    }
}
