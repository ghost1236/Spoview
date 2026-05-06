package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.match.MatchRepository
import kr.smiling.sportshub.domain.user.UserTeamSubscriptionRepository
import kr.smiling.sportshub.dto.response.MatchResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime

@Service
@Transactional(readOnly = true)
class FeedService(
    private val subscriptionRepository: UserTeamSubscriptionRepository,
    private val matchRepository: MatchRepository
) {
    fun getFeed(userId: Long): List<MatchResponse> {
        val teamCodes = subscriptionRepository.findByUser_Id(userId)
            .map { it.team.teamCode }
        if (teamCodes.isEmpty()) return emptyList()

        val today = LocalDate.now()
        val from = today.minusDays(3).atStartOfDay()
        val to = today.plusDays(7).atTime(LocalTime.MAX)

        return matchRepository.findByTeamCodesAndDateRange(teamCodes, from, to)
            .map { MatchResponse.from(it) }
    }

    fun getTodayMatches(): List<MatchResponse> {
        val today = LocalDate.now()
        val from = today.atStartOfDay()
        val to = today.atTime(LocalTime.MAX)

        // 모든 리그의 오늘 경기
        return matchRepository.findAll()
            .filter { it.matchDate >= from && it.matchDate <= to }
            .sortedBy { it.matchDate }
            .map { MatchResponse.from(it) }
    }
}
