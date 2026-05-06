package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class FanLevelInfo(
    val level: Int,
    val levelName: String,
    val totalPoints: Int,
    val nextLevelPoints: Int,
    val progress: Int // 0~100
)

@Service
class FanLevelService(
    private val fanActivityRepository: FanActivityRepository,
    private val userRepository: UserRepository
) {
    private val levelThresholds = listOf(
        0 to "루키 팬",        // Lv.1: 0+
        50 to "일반 팬",       // Lv.2: 50+
        150 to "열성 팬",      // Lv.3: 150+
        400 to "골수 팬",      // Lv.4: 400+
        1000 to "레전드 팬"    // Lv.5: 1000+
    )

    fun getFanLevel(userId: Long): FanLevelInfo {
        val totalPoints = fanActivityRepository.getTotalPoints(userId)
        val currentLevel = levelThresholds.indexOfLast { totalPoints >= it.first } + 1
        val currentThreshold = levelThresholds[currentLevel - 1].first
        val nextThreshold = if (currentLevel < levelThresholds.size) levelThresholds[currentLevel].first else currentThreshold
        val progress = if (nextThreshold > currentThreshold) {
            ((totalPoints - currentThreshold) * 100) / (nextThreshold - currentThreshold)
        } else 100

        return FanLevelInfo(
            level = currentLevel,
            levelName = levelThresholds[currentLevel - 1].second,
            totalPoints = totalPoints,
            nextLevelPoints = nextThreshold,
            progress = progress.coerceIn(0, 100)
        )
    }

    @Transactional
    fun recordActivity(userId: Long, type: ActivityType, points: Int = getDefaultPoints(type)) {
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
        fanActivityRepository.save(FanActivity(user = user, activityType = type, points = points))

        // 유저 레벨 업데이트
        val totalPoints = fanActivityRepository.getTotalPoints(userId)
        val newLevel = levelThresholds.indexOfLast { totalPoints >= it.first } + 1
        if (newLevel > user.fanLevel) {
            user.fanLevel = newLevel
        }
    }

    private fun getDefaultPoints(type: ActivityType): Int = when (type) {
        ActivityType.POST -> 5
        ActivityType.COMMENT -> 2
        ActivityType.LIKE -> 1
        ActivityType.PREDICTION -> 3
        ActivityType.LOGIN -> 1
    }
}
