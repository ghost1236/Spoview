package kr.smiling.sportshub.controller

import kr.smiling.sportshub.dto.response.LeagueResponse
import kr.smiling.sportshub.dto.response.MatchResponse
import kr.smiling.sportshub.dto.response.StandingResponse
import kr.smiling.sportshub.dto.response.TeamDetailResponse
import kr.smiling.sportshub.dto.response.TeamResponse
import kr.smiling.sportshub.service.MatchService
import kr.smiling.sportshub.service.TeamService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class TeamController(
    private val teamService: TeamService,
    private val matchService: MatchService
) {
    @GetMapping("/leagues")
    fun getLeagues(): List<LeagueResponse> = teamService.getAllLeagues()

    @GetMapping("/teams")
    fun getTeams(@RequestParam(required = false) leagueCode: String?): List<TeamResponse> =
        teamService.getAllTeams(leagueCode)

    @GetMapping("/teams/{teamCode}")
    fun getTeamDetail(@PathVariable teamCode: String): TeamDetailResponse =
        teamService.getTeamDetail(teamCode)

    @GetMapping("/teams/{teamCode}/matches")
    fun getTeamMatches(
        @PathVariable teamCode: String,
        @RequestParam(defaultValue = "30") days: Int
    ): List<MatchResponse> = matchService.getTeamMatches(teamCode, days)

    @GetMapping("/leagues/{leagueCode}/standings")
    fun getLeagueStandings(@PathVariable leagueCode: String): List<StandingResponse> =
        matchService.getLeagueStandings(leagueCode)
}
