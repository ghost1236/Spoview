package kr.smiling.sportshub.domain.match

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

interface MatchRepository : JpaRepository<Match, Long> {
    fun findByApiMatchId(apiMatchId: String): Match?

    @Query("""
        SELECT m FROM Match m
        WHERE (m.homeTeam.teamCode = :teamCode OR m.awayTeam.teamCode = :teamCode)
        AND m.matchDate BETWEEN :from AND :to
        ORDER BY m.matchDate
    """)
    fun findByTeamAndDateRange(teamCode: String, from: LocalDateTime, to: LocalDateTime): List<Match>

    fun findByLeague_LeagueCodeAndMatchDateBetweenOrderByMatchDate(
        leagueCode: String, from: LocalDateTime, to: LocalDateTime
    ): List<Match>

    fun findByStatusOrderByMatchDate(status: MatchStatus): List<Match>

    @Query("""
        SELECT m FROM Match m
        WHERE (m.homeTeam.teamCode IN :teamCodes OR m.awayTeam.teamCode IN :teamCodes)
        AND m.matchDate BETWEEN :from AND :to
        ORDER BY m.matchDate
    """)
    fun findByTeamCodesAndDateRange(
        teamCodes: List<String>, from: LocalDateTime, to: LocalDateTime
    ): List<Match>
}

interface StandingRepository : JpaRepository<Standing, Long> {
    fun findByLeague_LeagueCodeAndSeasonYearOrderByRankPosition(
        leagueCode: String, seasonYear: Int
    ): List<Standing>

    fun findByLeague_LeagueCodeAndTeam_TeamCodeAndSeasonYear(
        leagueCode: String, teamCode: String, seasonYear: Int
    ): Standing?
}
