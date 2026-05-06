package kr.smiling.sportshub.controller

import kr.smiling.sportshub.service.FanLevelInfo
import kr.smiling.sportshub.service.FanLevelService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserController(private val fanLevelService: FanLevelService) {

    @GetMapping("/me/fan-level")
    fun getMyFanLevel(auth: Authentication): FanLevelInfo {
        val userId = auth.principal as Long
        return fanLevelService.getFanLevel(userId)
    }
}
