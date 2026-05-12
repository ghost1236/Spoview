package kr.smiling.sportshub.service

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.team.League
import kr.smiling.sportshub.domain.team.Team
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.util.*

@ExtendWith(MockKExtension::class)
class SubscriptionServiceTest {

    @MockK
    private lateinit var subscriptionRepository: UserTeamSubscriptionRepository

    @MockK
    private lateinit var userRepository: UserRepository

    @MockK
    private lateinit var teamRepository: TeamRepository

    @MockK
    private lateinit var fanLevelService: FanLevelService

    @InjectMockKs
    private lateinit var subscriptionService: SubscriptionService

    private lateinit var testUser: User
    private lateinit var testLeague: League
    private lateinit var testTeam: Team

    @BeforeEach
    fun setUp() {
        clearAllMocks()
        testUser = User(
            id = 1L,
            email = "test@example.com",
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345"
        )
        testLeague = League(
            leagueCode = "epl",
            sportType = SportType.FOOTBALL,
            nameKo = "프리미어리그",
            nameEn = "Premier League",
            country = "England",
            seasonYear = 2026
        )
        testTeam = Team(
            teamCode = "mci",
            league = testLeague,
            sportType = SportType.FOOTBALL,
            nameKo = "맨체스터 시티",
            nameEn = "Manchester City"
        )
    }

    @Test
    fun `TC-005 팀 구독 추가 성공`() {
        // Arrange
        every { subscriptionRepository.existsByUser_IdAndTeam_TeamCode(1L, "mci") } returns false
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { teamRepository.findByTeamCode("mci") } returns testTeam
        every { subscriptionRepository.save(any()) } returns UserTeamSubscription(
            id = 1L, user = testUser, team = testTeam
        )
        every { fanLevelService.recordActivity(1L, ActivityType.TEAM_SUBSCRIBE) } just Runs

        // Act
        val result = subscriptionService.subscribe(1L, "mci")

        // Assert
        assertEquals("mci", result.teamCode)
        assertEquals("맨체스터 시티", result.nameKo)
        verify(exactly = 1) { subscriptionRepository.save(any()) }
        verify(exactly = 1) { fanLevelService.recordActivity(1L, ActivityType.TEAM_SUBSCRIBE) }
    }

    @Test
    fun `TC-006 중복 구독 시 ALREADY_SUBSCRIBED 예외`() {
        // Arrange
        every { subscriptionRepository.existsByUser_IdAndTeam_TeamCode(1L, "mci") } returns true

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            subscriptionService.subscribe(1L, "mci")
        }
        assertEquals(ErrorCode.ALREADY_SUBSCRIBED, exception.errorCode)
    }

    @Test
    fun `TC-007 존재하지 않는 유저로 구독 시 USER_NOT_FOUND 예외`() {
        // Arrange
        every { subscriptionRepository.existsByUser_IdAndTeam_TeamCode(999L, "mci") } returns false
        every { userRepository.findById(999L) } returns Optional.empty()

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            subscriptionService.subscribe(999L, "mci")
        }
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `TC-008 존재하지 않는 팀 구독 시 TEAM_NOT_FOUND 예외`() {
        // Arrange
        every { subscriptionRepository.existsByUser_IdAndTeam_TeamCode(1L, "xxx") } returns false
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { teamRepository.findByTeamCode("xxx") } returns null

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            subscriptionService.subscribe(1L, "xxx")
        }
        assertEquals(ErrorCode.TEAM_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `TC-009 구독 해지 성공`() {
        // Arrange
        every { subscriptionRepository.deleteByUser_IdAndTeam_TeamCode(1L, "mci") } just Runs

        // Act
        subscriptionService.unsubscribe(1L, "mci")

        // Assert
        verify(exactly = 1) { subscriptionRepository.deleteByUser_IdAndTeam_TeamCode(1L, "mci") }
    }

    @Test
    fun `TC-010 구독 목록 조회`() {
        // Arrange
        val subscription = UserTeamSubscription(id = 1L, user = testUser, team = testTeam)
        every { subscriptionRepository.findByUser_Id(1L) } returns listOf(subscription)

        // Act
        val result = subscriptionService.getSubscriptions(1L)

        // Assert
        assertEquals(1, result.size)
        assertEquals("mci", result[0].teamCode)
        assertEquals("맨체스터 시티", result[0].nameKo)
    }
}
