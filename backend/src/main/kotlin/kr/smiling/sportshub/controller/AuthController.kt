package kr.smiling.sportshub.controller

import kr.smiling.sportshub.dto.request.LoginRequest
import kr.smiling.sportshub.service.AuthResponse
import kr.smiling.sportshub.service.AuthService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): AuthResponse {
        return authService.loginOrRegister(request)
    }
}
