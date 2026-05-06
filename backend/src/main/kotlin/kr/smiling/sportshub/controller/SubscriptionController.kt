package kr.smiling.sportshub.controller

import kr.smiling.sportshub.dto.request.SubscribeRequest
import kr.smiling.sportshub.dto.response.TeamResponse
import kr.smiling.sportshub.service.SubscriptionService
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/subscriptions")
class SubscriptionController(private val subscriptionService: SubscriptionService) {

    @GetMapping
    fun getSubscriptions(auth: Authentication): List<TeamResponse> {
        val userId = auth.principal as Long
        return subscriptionService.getSubscriptions(userId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun subscribe(auth: Authentication, @RequestBody request: SubscribeRequest): TeamResponse {
        val userId = auth.principal as Long
        return subscriptionService.subscribe(userId, request.teamCode)
    }

    @DeleteMapping("/{teamCode}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun unsubscribe(auth: Authentication, @PathVariable teamCode: String) {
        val userId = auth.principal as Long
        subscriptionService.unsubscribe(userId, teamCode)
    }
}
