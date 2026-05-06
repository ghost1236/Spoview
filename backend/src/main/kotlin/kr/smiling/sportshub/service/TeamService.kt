package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.team.LeagueRepository
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.dto.response.LeagueResponse
import kr.smiling.sportshub.dto.response.TeamDetailResponse
import kr.smiling.sportshub.dto.response.TeamResponse
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TeamService(
    private val teamRepository: TeamRepository,
    private val leagueRepository: LeagueRepository
) {
    fun getAllLeagues(): List<LeagueResponse> {
        return leagueRepository.findAllByOrderByDisplayOrder().map { LeagueResponse.from(it) }
    }

    fun getAllTeams(leagueCode: String?): List<TeamResponse> {
        val teams = if (leagueCode != null) {
            teamRepository.findByLeague_LeagueCode(leagueCode)
        } else {
            teamRepository.findAll()
        }
        return teams.map { TeamResponse.from(it) }
    }

    fun getTeamDetail(teamCode: String): TeamDetailResponse {
        val team = teamRepository.findByTeamCode(teamCode)
            ?: throw BusinessException(ErrorCode.TEAM_NOT_FOUND)
        return TeamDetailResponse.from(team)
    }
}
