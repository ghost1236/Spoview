package kr.smiling.sportshub.controller

import kr.smiling.sportshub.dto.response.MatchResponse
import kr.smiling.sportshub.service.FeedService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/feed")
class FeedController(private val feedService: FeedService) {

    @GetMapping
    fun getFeed(auth: Authentication): List<MatchResponse> {
        val userId = auth.principal as Long
        return feedService.getFeed(userId)
    }

    @GetMapping("/today")
    fun getTodayMatches(): List<MatchResponse> = feedService.getTodayMatches()
}
