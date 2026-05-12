package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.community.*
import kr.smiling.sportshub.domain.user.UserRepository
import kr.smiling.sportshub.domain.user.UserTeamSubscriptionRepository
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import nl.martijndwars.webpush.Notification
import nl.martijndwars.webpush.PushService
import nl.martijndwars.webpush.Subscription
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Security
import com.google.gson.Gson
import jakarta.annotation.PostConstruct

data class NotificationResponse(
    val id: Long,
    val type: String,
    val title: String,
    val body: String,
    val isRead: Boolean,
    val createdAt: String
)

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val pushTokenRepository: PushTokenRepository,
    private val userRepository: UserRepository,
    private val subscriptionRepository: UserTeamSubscriptionRepository,
    @Value("\${webpush.vapid.public-key:}") private val vapidPublicKey: String,
    @Value("\${webpush.vapid.private-key:}") private val vapidPrivateKey: String,
    @Value("\${webpush.vapid.subject:mailto:smiling1236@gmail.com}") private val vapidSubject: String,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val gson = Gson()
    private var pushService: PushService? = null

    @PostConstruct
    fun init() {
        if (vapidPublicKey.isNotBlank() && vapidPrivateKey.isNotBlank()) {
            Security.addProvider(BouncyCastleProvider())
            pushService = PushService(vapidPublicKey, vapidPrivateKey, vapidSubject)
            log.info("Web Push 서비스 초기화 완료 (VAPID)")
        } else {
            log.warn("VAPID 키가 설정되지 않아 Web Push가 비활성화됩니다")
        }
    }

    @Transactional(readOnly = true)
    fun getNotifications(userId: Long, pageable: Pageable): Page<NotificationResponse> {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable).map {
            NotificationResponse(it.id, it.type.name, it.title, it.body, it.isRead, it.createdAt.toString())
        }
    }

    @Transactional(readOnly = true)
    fun getUnreadCount(userId: Long): Long {
        return notificationRepository.countByUser_IdAndIsRead(userId, false)
    }

    @Transactional
    fun markAsRead(userId: Long, notificationId: Long) {
        val notif = notificationRepository.findById(notificationId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        if (notif.user.id != userId) throw BusinessException(ErrorCode.FORBIDDEN)
        notif.isRead = true
    }

    @Transactional
    fun markAllAsRead(userId: Long) {
        val unread = notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, Pageable.unpaged())
        unread.forEach { if (!it.isRead) it.isRead = true }
    }

    /** 특정 유저에게 알림 생성 + 푸시 발송 */
    @Transactional
    fun createNotification(userId: Long, type: NotificationType, title: String, body: String, data: String? = null) {
        val user = userRepository.findById(userId).orElse(null) ?: return
        notificationRepository.save(kr.smiling.sportshub.domain.community.Notification(
            user = user, type = type, title = title, body = body, data = data
        ))
        log.info("알림 생성: userId={} type={} title={}", userId, type, title)

        // Web Push 발송
        sendPushToUser(userId, title, body)
    }

    /** 특정 팀 구독자 전체에게 알림 */
    @Transactional
    fun notifyTeamSubscribers(teamCode: String, type: NotificationType, title: String, body: String) {
        val subs = subscriptionRepository.findAll().filter { it.team.teamCode == teamCode }
        for (sub in subs) {
            createNotification(sub.user.id, type, title, body)
        }
        log.info("팀 알림 발송: team={} type={} 수신자={}명", teamCode, type, subs.size)
    }

    /** Web Push 발송 */
    private fun sendPushToUser(userId: Long, title: String, body: String) {
        val service = pushService ?: return
        val tokens = pushTokenRepository.findByUser_Id(userId)
        if (tokens.isEmpty()) return

        val payload = gson.toJson(mapOf("title" to title, "body" to body, "icon" to "/favicon.ico"))

        for (token in tokens) {
            try {
                // token은 JSON 형태의 PushSubscription (endpoint, keys)
                val sub = gson.fromJson(token.token, Subscription::class.java)
                val notification = Notification(sub, payload)
                service.send(notification)
                log.debug("푸시 발송 성공: userId={}", userId)
            } catch (e: Exception) {
                log.warn("푸시 발송 실패: userId={} error={}", userId, e.message)
                // 만료된 토큰이면 삭제
                if (e.message?.contains("410") == true || e.message?.contains("404") == true) {
                    pushTokenRepository.deleteByUser_IdAndToken(userId, token.token)
                    log.info("만료된 푸시 토큰 삭제: userId={}", userId)
                }
            }
        }
    }

    /** Push subscription 등록 (Web Push용 - JSON 형태) */
    @Transactional
    fun registerPushToken(userId: Long, token: String) {
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
        if (pushTokenRepository.findByUser_IdAndToken(userId, token) == null) {
            pushTokenRepository.save(PushToken(user = user, token = token))
            log.info("푸시 토큰 등록: userId={}", userId)
        }
    }

    /** Push subscription 제거 */
    @Transactional
    fun removePushToken(userId: Long, token: String) {
        pushTokenRepository.deleteByUser_IdAndToken(userId, token)
    }

    fun getVapidPublicKey(): String = vapidPublicKey
}
