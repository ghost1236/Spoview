package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

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
    private val log = LoggerFactory.getLogger(javaClass)

    private val levelThresholds = listOf(
        0 to "루키 팬",        // Lv.1
        50 to "일반 팬",       // Lv.2
        150 to "열성 팬",      // Lv.3
        400 to "골수 팬",      // Lv.4
        1000 to "레전드 팬"    // Lv.5
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

    /** 활동 기록 + 포인트 적립 */
    @Transactional
    fun recordActivity(userId: Long, type: ActivityType, points: Int = type.defaultPoints) {
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }

        // 일일 로그인: 하루 1번만
        if (type == ActivityType.LOGIN) {
            val todayStart = LocalDate.now().atStartOfDay()
            val count = fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(userId, type, todayStart)
            if (count > 0) return
        }

        // 회원가입: 1번만
        if (type == ActivityType.SIGNUP) {
            val count = fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(userId, type, user.createdAt)
            if (count > 0) return
        }

        fanActivityRepository.save(FanActivity(user = user, activityType = type, points = points))

        // 유저 레벨 + 총 포인트 업데이트
        val totalPoints = fanActivityRepository.getTotalPoints(userId)
        user.totalPoints = totalPoints
        val newLevel = levelThresholds.indexOfLast { totalPoints >= it.first } + 1
        if (newLevel > user.fanLevel) {
            user.fanLevel = newLevel
            log.info("레벨업! userId={} lv={} ({})", userId, newLevel, levelThresholds[newLevel - 1].second)
        }

        log.debug("포인트 적립: userId={} +{}P ({}) total={}P", userId, points, type.name, totalPoints)
    }

    /** 일일 로그인 포인트 + 연속 로그인 체크 */
    @Transactional
    fun recordLogin(userId: Long) {
        recordActivity(userId, ActivityType.LOGIN)

        // 연속 7일 로그인 보너스 체크
        val last7days = LocalDate.now().minusDays(7).atStartOfDay()
        val loginDays = fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
            userId, ActivityType.LOGIN, last7days
        )
        // 7일째 로그인이면 보너스 (이번 로그인 포함해서 7)
        if (loginDays == 7L) {
            val streakToday = LocalDate.now().atStartOfDay()
            val streakCount = fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                userId, ActivityType.LOGIN_STREAK, streakToday
            )
            if (streakCount == 0L) {
                recordActivity(userId, ActivityType.LOGIN_STREAK)
                log.info("연속 로그인 보너스! userId={}", userId)
            }
        }
    }

    /** 첫 게시글 보너스 체크 */
    @Transactional
    fun checkFirstPost(userId: Long) {
        val count = fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
            userId, ActivityType.FIRST_POST, java.time.LocalDateTime.of(2020, 1, 1, 0, 0)
        )
        if (count == 0L) {
            recordActivity(userId, ActivityType.FIRST_POST)
            log.info("첫 게시글 보너스! userId={}", userId)
        }
    }

    /** 좋아요 마일스톤 체크 (게시글 작성자에게) */
    @Transactional
    fun checkLikeMilestone(postAuthorId: Long, currentLikeCount: Int) {
        if (currentLikeCount == 10 || currentLikeCount == 50 || currentLikeCount == 100) {
            recordActivity(postAuthorId, ActivityType.LIKE_MILESTONE)
            log.info("좋아요 {}개 마일스톤 달성! userId={}", currentLikeCount, postAuthorId)
        }
    }
}
