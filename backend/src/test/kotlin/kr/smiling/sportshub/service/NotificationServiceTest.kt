package kr.smiling.sportshub.service

import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import kr.smiling.sportshub.domain.community.*
import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class NotificationServiceTest {

    @MockK
    private lateinit var notificationRepository: NotificationRepository

    @MockK
    private lateinit var pushTokenRepository: PushTokenRepository

    @MockK
    private lateinit var userRepository: UserRepository

    @MockK
    private lateinit var subscriptionRepository: UserTeamSubscriptionRepository

    private lateinit var notificationService: NotificationService

    private lateinit var testUser: User
    private lateinit var testNotification: Notification

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

        testNotification = Notification(
            id = 1L,
            user = testUser,
            type = NotificationType.MATCH_START,
            title = "경기 시작",
            body = "맨시티 vs 리버풀 경기가 시작되었습니다"
        )

        // NotificationService는 @Value 파라미터가 있어 직접 생성
        notificationService = NotificationService(
            notificationRepository = notificationRepository,
            pushTokenRepository = pushTokenRepository,
            userRepository = userRepository,
            subscriptionRepository = subscriptionRepository,
            vapidPublicKey = "",
            vapidPrivateKey = "",
            vapidSubject = "mailto:test@example.com"
        )
    }

    @Test
    fun `TC-031 알림 생성 성공`() {
        // Arrange
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { notificationRepository.save(any()) } returns testNotification
        every { pushTokenRepository.findByUser_Id(1L) } returns emptyList()

        // Act
        notificationService.createNotification(
            1L, NotificationType.MATCH_START, "경기 시작", "맨시티 vs 리버풀 경기가 시작되었습니다"
        )

        // Assert
        verify(exactly = 1) {
            notificationRepository.save(match {
                it.type == NotificationType.MATCH_START && it.title == "경기 시작"
            })
        }
    }

    @Test
    fun `TC-031 존재하지 않는 유저에게 알림 생성 시 무시`() {
        // Arrange
        every { userRepository.findById(999L) } returns Optional.empty()

        // Act
        notificationService.createNotification(
            999L, NotificationType.MATCH_START, "경기 시작", "내용"
        )

        // Assert
        verify(exactly = 0) { notificationRepository.save(any()) }
    }

    @Test
    fun `TC-032 알림 읽음 처리`() {
        // Arrange
        assertFalse(testNotification.isRead)
        every { notificationRepository.findById(1L) } returns Optional.of(testNotification)

        // Act
        notificationService.markAsRead(1L, 1L)

        // Assert
        assertTrue(testNotification.isRead)
    }

    @Test
    fun `TC-033 타인의 알림 읽음 처리 시 FORBIDDEN`() {
        // Arrange
        every { notificationRepository.findById(1L) } returns Optional.of(testNotification)

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            notificationService.markAsRead(999L, 1L)
        }
        assertEquals(ErrorCode.FORBIDDEN, exception.errorCode)
    }

    @Test
    fun `TC-034 읽지 않은 알림 개수 조회`() {
        // Arrange
        every { notificationRepository.countByUser_IdAndIsRead(1L, false) } returns 3L

        // Act
        val result = notificationService.getUnreadCount(1L)

        // Assert
        assertEquals(3L, result)
    }

    @Test
    fun `TC-035 전체 알림 읽음 처리`() {
        // Arrange
        val notif1 = Notification(id = 1L, user = testUser, type = NotificationType.MATCH_START, title = "알림1", body = "내용1")
        val notif2 = Notification(id = 2L, user = testUser, type = NotificationType.GOAL, title = "알림2", body = "내용2")
        val notif3 = Notification(id = 3L, user = testUser, type = NotificationType.RESULT, title = "알림3", body = "내용3", isRead = true)

        val page = PageImpl(listOf(notif1, notif2, notif3))
        every { notificationRepository.findByUser_IdOrderByCreatedAtDesc(1L, Pageable.unpaged()) } returns page

        // Act
        notificationService.markAllAsRead(1L)

        // Assert
        assertTrue(notif1.isRead)
        assertTrue(notif2.isRead)
        assertTrue(notif3.isRead)
    }

    @Test
    fun `알림 목록 조회 페이징`() {
        // Arrange
        val pageable = PageRequest.of(0, 10)
        val page = PageImpl(listOf(testNotification))
        every { notificationRepository.findByUser_IdOrderByCreatedAtDesc(1L, pageable) } returns page

        // Act
        val result = notificationService.getNotifications(1L, pageable)

        // Assert
        assertEquals(1, result.content.size)
        assertEquals("경기 시작", result.content[0].title)
        assertEquals("MATCH_START", result.content[0].type)
    }

    @Test
    fun `VAPID 공개키 반환`() {
        // Act
        val key = notificationService.getVapidPublicKey()

        // Assert
        assertEquals("", key)
    }
}
