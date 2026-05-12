package kr.smiling.sportshub.service

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.dto.request.LoginRequest
import kr.smiling.sportshub.security.JwtTokenProvider
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(MockKExtension::class)
class AuthServiceTest {

    @MockK
    private lateinit var userRepository: UserRepository

    @MockK
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @MockK
    private lateinit var fanLevelService: FanLevelService

    @InjectMockKs
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `TC-001 신규 유저 OAuth 로그인 시 회원가입 후 JWT 발급`() {
        // Arrange
        val request = LoginRequest(
            provider = "KAKAO",
            providerId = "12345",
            email = "test@example.com",
            nickname = "테스터",
            profileImg = null
        )
        val savedUser = User(
            id = 1L,
            email = "test@example.com",
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345"
        )

        every { userRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "12345") } returns null
        every { userRepository.save(any()) } returns savedUser
        every { fanLevelService.recordActivity(1L, ActivityType.SIGNUP) } just Runs
        every { fanLevelService.recordLogin(1L) } just Runs
        every { jwtTokenProvider.generateToken(1L, "test@example.com") } returns "jwt-token-123"

        // Act
        val result = authService.loginOrRegister(request)

        // Assert
        assertEquals("jwt-token-123", result.token)
        assertEquals(1L, result.userId)
        assertEquals("테스터", result.nickname)

        verify(exactly = 1) { userRepository.save(any()) }
        verify(exactly = 1) { fanLevelService.recordActivity(1L, ActivityType.SIGNUP) }
        verify(exactly = 1) { fanLevelService.recordLogin(1L) }
        verify(exactly = 1) { jwtTokenProvider.generateToken(1L, "test@example.com") }
    }

    @Test
    fun `TC-002 기존 유저 OAuth 로그인 시 JWT 발급`() {
        // Arrange
        val request = LoginRequest(
            provider = "KAKAO",
            providerId = "12345",
            email = "test@example.com",
            nickname = "테스터"
        )
        val existingUser = User(
            id = 1L,
            email = "test@example.com",
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345"
        )

        every { userRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "12345") } returns existingUser
        every { fanLevelService.recordLogin(1L) } just Runs
        every { jwtTokenProvider.generateToken(1L, "test@example.com") } returns "jwt-token-456"

        // Act
        val result = authService.loginOrRegister(request)

        // Assert
        assertEquals("jwt-token-456", result.token)
        assertEquals(1L, result.userId)

        verify(exactly = 0) { userRepository.save(any()) }
        verify(exactly = 0) { fanLevelService.recordActivity(1L, ActivityType.SIGNUP) }
        verify(exactly = 1) { fanLevelService.recordLogin(1L) }
    }

    @Test
    fun `TC-003 기존 유저 이메일 없을 때 이메일 업데이트`() {
        // Arrange
        val request = LoginRequest(
            provider = "KAKAO",
            providerId = "12345",
            email = "new@example.com",
            nickname = "테스터"
        )
        val existingUser = User(
            id = 1L,
            email = null,
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345"
        )

        every { userRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "12345") } returns existingUser
        every { fanLevelService.recordLogin(1L) } just Runs
        every { jwtTokenProvider.generateToken(1L, "new@example.com") } returns "jwt-token"

        // Act
        authService.loginOrRegister(request)

        // Assert
        assertEquals("new@example.com", existingUser.email)
    }

    @Test
    fun `TC-004 잘못된 provider 값 로그인 시 예외`() {
        // Arrange
        val request = LoginRequest(
            provider = "INVALID",
            providerId = "12345",
            email = "test@example.com",
            nickname = "테스터"
        )

        // Act & Assert
        assertThrows<IllegalArgumentException> {
            authService.loginOrRegister(request)
        }
    }
}
