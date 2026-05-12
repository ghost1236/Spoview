package kr.smiling.sportshub.service

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.exception.BusinessException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class FanLevelServiceTest {

    @MockK
    private lateinit var fanActivityRepository: FanActivityRepository

    @MockK
    private lateinit var userRepository: UserRepository

    @InjectMockKs
    private lateinit var fanLevelService: FanLevelService

    private lateinit var testUser: User

    @BeforeEach
    fun setUp() {
        clearAllMocks()
        testUser = User(
            id = 1L,
            email = "test@example.com",
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345",
            fanLevel = 1,
            totalPoints = 0
        )
    }

    @Test
    fun `TC-024 활동 포인트 적립 - 게시글 작성 시 5P`() {
        // Arrange
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { fanActivityRepository.save(any()) } returns FanActivity(
            id = 1L, user = testUser, activityType = ActivityType.POST, points = 5
        )
        every { fanActivityRepository.getTotalPoints(1L) } returns 5

        // Act
        fanLevelService.recordActivity(1L, ActivityType.POST)

        // Assert
        verify(exactly = 1) {
            fanActivityRepository.save(match { it.activityType == ActivityType.POST && it.points == 5 })
        }
        assertEquals(5, testUser.totalPoints)
    }

    @Test
    fun `TC-025 일일 로그인 중복 방지 - 오늘 이미 로그인한 경우 포인트 미적립`() {
        // Arrange
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every {
            fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                1L, ActivityType.LOGIN, any()
            )
        } returns 1L

        // Act
        fanLevelService.recordActivity(1L, ActivityType.LOGIN)

        // Assert
        verify(exactly = 0) { fanActivityRepository.save(any()) }
    }

    @Test
    fun `TC-026 회원가입 포인트 중복 방지`() {
        // Arrange
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every {
            fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                1L, ActivityType.SIGNUP, any()
            )
        } returns 1L

        // Act
        fanLevelService.recordActivity(1L, ActivityType.SIGNUP)

        // Assert
        verify(exactly = 0) { fanActivityRepository.save(any()) }
    }

    @Test
    fun `TC-027 레벨 계산 정확성 - Lv1 루키 팬 (0P)`() {
        // Arrange
        every { fanActivityRepository.getTotalPoints(1L) } returns 0

        // Act
        val result = fanLevelService.getFanLevel(1L)

        // Assert
        assertEquals(1, result.level)
        assertEquals("루키 팬", result.levelName)
        assertEquals(0, result.totalPoints)
        assertEquals(50, result.nextLevelPoints)
        assertEquals(0, result.progress)
    }

    @Test
    fun `TC-027 레벨 계산 정확성 - Lv2 일반 팬 (50P)`() {
        // Arrange
        every { fanActivityRepository.getTotalPoints(1L) } returns 50

        // Act
        val result = fanLevelService.getFanLevel(1L)

        // Assert
        assertEquals(2, result.level)
        assertEquals("일반 팬", result.levelName)
        assertEquals(50, result.totalPoints)
        assertEquals(150, result.nextLevelPoints)
        assertEquals(0, result.progress)
    }

    @Test
    fun `TC-027 레벨 계산 정확성 - Lv1 경계값 (49P)`() {
        // Arrange
        every { fanActivityRepository.getTotalPoints(1L) } returns 49

        // Act
        val result = fanLevelService.getFanLevel(1L)

        // Assert
        assertEquals(1, result.level)
        assertEquals("루키 팬", result.levelName)
        assertEquals(98, result.progress) // (49-0)*100/(50-0) = 98
    }

    @Test
    fun `TC-027 레벨 계산 정확성 - Lv5 레전드 팬 (1000P) progress 100`() {
        // Arrange
        every { fanActivityRepository.getTotalPoints(1L) } returns 1000

        // Act
        val result = fanLevelService.getFanLevel(1L)

        // Assert
        assertEquals(5, result.level)
        assertEquals("레전드 팬", result.levelName)
        assertEquals(100, result.progress)
    }

    @Test
    fun `TC-028 레벨업 시 유저 fanLevel 갱신`() {
        // Arrange
        testUser.fanLevel = 1
        testUser.totalPoints = 0

        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every {
            fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                1L, ActivityType.SIGNUP, any()
            )
        } returns 0L
        every { fanActivityRepository.save(any()) } returns FanActivity(
            id = 1L, user = testUser, activityType = ActivityType.SIGNUP, points = 50
        )
        every { fanActivityRepository.getTotalPoints(1L) } returns 50

        // Act
        fanLevelService.recordActivity(1L, ActivityType.SIGNUP)

        // Assert
        assertEquals(2, testUser.fanLevel)
        assertEquals(50, testUser.totalPoints)
    }

    @Test
    fun `TC-029 첫 게시글 보너스 적립`() {
        // Arrange
        every {
            fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                1L, ActivityType.FIRST_POST, any()
            )
        } returns 0L
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { fanActivityRepository.save(any()) } returns FanActivity(
            id = 1L, user = testUser, activityType = ActivityType.FIRST_POST, points = 20
        )
        every { fanActivityRepository.getTotalPoints(1L) } returns 20

        // Act
        fanLevelService.checkFirstPost(1L)

        // Assert
        verify(exactly = 1) {
            fanActivityRepository.save(match { it.activityType == ActivityType.FIRST_POST })
        }
    }

    @Test
    fun `TC-030 좋아요 마일스톤 보너스 10개 달성`() {
        // Arrange
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every {
            fanActivityRepository.countByUser_IdAndActivityTypeAndCreatedAtAfter(
                1L, ActivityType.LIKE_MILESTONE, any()
            )
        } returns 0L
        every { fanActivityRepository.save(any()) } returns FanActivity(
            id = 1L, user = testUser, activityType = ActivityType.LIKE_MILESTONE, points = 10
        )
        every { fanActivityRepository.getTotalPoints(1L) } returns 10

        // Act
        fanLevelService.checkLikeMilestone(1L, 10)

        // Assert
        verify(exactly = 1) {
            fanActivityRepository.save(match { it.activityType == ActivityType.LIKE_MILESTONE })
        }
    }

    @Test
    fun `TC-030 좋아요 마일스톤 - 비해당 숫자(9개)는 보너스 미적립`() {
        // Act
        fanLevelService.checkLikeMilestone(1L, 9)

        // Assert
        verify(exactly = 0) { fanActivityRepository.save(any()) }
    }
}
