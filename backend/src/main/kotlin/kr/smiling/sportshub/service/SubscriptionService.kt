package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.domain.user.UserRepository
import kr.smiling.sportshub.domain.user.UserTeamSubscription
import kr.smiling.sportshub.domain.user.UserTeamSubscriptionRepository
import kr.smiling.sportshub.dto.response.TeamResponse
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SubscriptionService(
    private val subscriptionRepository: UserTeamSubscriptionRepository,
    private val userRepository: UserRepository,
    private val teamRepository: TeamRepository,
    private val fanLevelService: FanLevelService
) {
    @Transactional(readOnly = true)
    fun getSubscriptions(userId: Long): List<TeamResponse> {
        return subscriptionRepository.findByUser_Id(userId)
            .map { TeamResponse.from(it.team) }
    }

    @Transactional
    fun subscribe(userId: Long, teamCode: String): TeamResponse {
        if (subscriptionRepository.existsByUser_IdAndTeam_TeamCode(userId, teamCode)) {
            throw BusinessException(ErrorCode.ALREADY_SUBSCRIBED)
        }
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
        val team = teamRepository.findByTeamCode(teamCode) ?: throw BusinessException(ErrorCode.TEAM_NOT_FOUND)

        subscriptionRepository.save(UserTeamSubscription(user = user, team = team))
        fanLevelService.recordActivity(userId, kr.smiling.sportshub.domain.user.ActivityType.TEAM_SUBSCRIBE)
        return TeamResponse.from(team)
    }

    @Transactional
    fun unsubscribe(userId: Long, teamCode: String) {
        subscriptionRepository.deleteByUser_IdAndTeam_TeamCode(userId, teamCode)
    }
}
