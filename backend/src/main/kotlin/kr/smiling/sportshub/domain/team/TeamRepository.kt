package kr.smiling.sportshub.domain.team

import kr.smiling.sportshub.domain.common.SportType
import org.springframework.data.jpa.repository.JpaRepository

interface TeamRepository : JpaRepository<Team, String> {
    fun findByLeague_LeagueCode(leagueCode: String): List<Team>
    fun findBySportType(sportType: SportType): List<Team>
    fun findByApiFootballId(apiFootballId: Int): Team?
    fun findByMlbTeamId(mlbTeamId: Int): Team?
    fun findByTeamCode(teamCode: String): Team?
}
