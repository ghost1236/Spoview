package kr.smiling.sportshub.controller

import kr.smiling.sportshub.service.NotificationResponse
import kr.smiling.sportshub.service.NotificationService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(private val notificationService: NotificationService) {

    @GetMapping
    fun getNotifications(
        auth: Authentication,
        @PageableDefault(size = 20) pageable: Pageable
    ): Page<NotificationResponse> {
        val userId = auth.principal as Long
        return notificationService.getNotifications(userId, pageable)
    }

    @GetMapping("/unread-count")
    fun getUnreadCount(auth: Authentication): Map<String, Long> {
        val userId = auth.principal as Long
        return mapOf("count" to notificationService.getUnreadCount(userId))
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun markAsRead(auth: Authentication, @PathVariable id: Long) {
        val userId = auth.principal as Long
        notificationService.markAsRead(userId, id)
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun markAllAsRead(auth: Authentication) {
        val userId = auth.principal as Long
        notificationService.markAllAsRead(userId)
    }

    @PostMapping("/push-token")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerPushToken(auth: Authentication, @RequestBody body: Map<String, String>) {
        val userId = auth.principal as Long
        val token = body["token"] ?: return
        notificationService.registerPushToken(userId, token)
    }

    @DeleteMapping("/push-token")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removePushToken(auth: Authentication, @RequestBody body: Map<String, String>) {
        val userId = auth.principal as Long
        val token = body["token"] ?: return
        notificationService.removePushToken(userId, token)
    }

    @GetMapping("/vapid-key")
    fun getVapidPublicKey(): Map<String, String> {
        return mapOf("publicKey" to notificationService.getVapidPublicKey())
    }
}
