package kr.smiling.sportshub.controller

import kr.smiling.sportshub.scheduler.FootballDataScheduler
import kr.smiling.sportshub.scheduler.KLeagueDataScheduler
import kr.smiling.sportshub.scheduler.MlbDataScheduler
import kr.smiling.sportshub.scheduler.KboDataScheduler
import kr.smiling.sportshub.security.JwtTokenProvider
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin")
class AdminController(
    private val footballScheduler: FootballDataScheduler,
    private val kleagueScheduler: KLeagueDataScheduler,
    private val mlbScheduler: MlbDataScheduler,
    private val kboScheduler: KboDataScheduler,
    private val jwtTokenProvider: JwtTokenProvider
) {
    @PostMapping("/test-login")
    fun testLogin(): Map<String, Any> {
        val token = jwtTokenProvider.generateToken(1L, "test@smiling.kr")
        return mapOf("token" to token, "userId" to 1L, "nickname" to "테스트유저")
    }

    @PostMapping("/collect/football-standings")
    fun collectFootballStandings(): Map<String, String> {
        footballScheduler.collectStandings()
        return mapOf("status" to "done")
    }

    @PostMapping("/collect/football-fixtures")
    fun collectFootballFixtures(
        @RequestParam(required = false) from: String?,
        @RequestParam(required = false) to: String?
    ): Map<String, String> {
        if (from != null && to != null) {
            footballScheduler.collectFixturesRange(from, to)
        } else {
            footballScheduler.collectTodayFixtures()
            footballScheduler.collectYesterdayResults()
        }
        return mapOf("status" to "done")
    }

    @PostMapping("/collect/kleague")
    fun collectKleague(): Map<String, String> {
        kleagueScheduler.collectStandings()
        kleagueScheduler.collectMatches()
        return mapOf("status" to "done")
    }

    @PostMapping("/collect/mlb")
    fun collectMlb(): Map<String, String> {
        mlbScheduler.collectStandings()
        mlbScheduler.collectSchedule()
        return mapOf("status" to "done")
    }

    @PostMapping("/collect/kbo")
    fun collectKbo(): Map<String, String> {
        kboScheduler.collectStandings()
        kboScheduler.collectMatches()
        return mapOf("status" to "done")
    }

    @PostMapping("/collect/all")
    fun collectAll(): Map<String, String> {
        footballScheduler.collectStandings()
        kleagueScheduler.collectStandings()
        mlbScheduler.collectStandings()
        mlbScheduler.collectSchedule()
        kboScheduler.collectStandings()
        return mapOf("status" to "all done")
    }
}
