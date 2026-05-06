package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.community.MatchPrediction
import kr.smiling.sportshub.domain.community.MatchPredictionRepository
import kr.smiling.sportshub.domain.community.PredictionChoice
import kr.smiling.sportshub.domain.match.MatchRepository
import kr.smiling.sportshub.domain.user.ActivityType
import kr.smiling.sportshub.domain.user.UserRepository
import kr.smiling.sportshub.dto.response.PredictionResponse
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PredictionService(
    private val predictionRepository: MatchPredictionRepository,
    private val matchRepository: MatchRepository,
    private val userRepository: UserRepository,
    private val fanLevelService: FanLevelService
) {
    @Transactional(readOnly = true)
    fun getPrediction(matchId: Long, userId: Long?): PredictionResponse {
        val total = predictionRepository.countByMatch_Id(matchId)
        val home = predictionRepository.countByMatch_IdAndPrediction(matchId, PredictionChoice.HOME)
        val draw = predictionRepository.countByMatch_IdAndPrediction(matchId, PredictionChoice.DRAW)
        val away = predictionRepository.countByMatch_IdAndPrediction(matchId, PredictionChoice.AWAY)
        val myPrediction = userId?.let {
            predictionRepository.findByMatch_IdAndUser_Id(matchId, it)?.prediction?.name
        }

        return PredictionResponse(
            matchId = matchId,
            totalVotes = total,
            homeVotes = home,
            drawVotes = draw,
            awayVotes = away,
            myPrediction = myPrediction
        )
    }

    @Transactional
    fun predict(matchId: Long, userId: Long, prediction: String) {
        if (predictionRepository.findByMatch_IdAndUser_Id(matchId, userId) != null) {
            throw BusinessException(ErrorCode.ALREADY_PREDICTED)
        }
        val match = matchRepository.findById(matchId).orElseThrow { BusinessException(ErrorCode.MATCH_NOT_FOUND) }
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }

        predictionRepository.save(MatchPrediction(
            match = match,
            user = user,
            prediction = PredictionChoice.valueOf(prediction.uppercase())
        ))
        fanLevelService.recordActivity(userId, ActivityType.PREDICTION)
    }
}
