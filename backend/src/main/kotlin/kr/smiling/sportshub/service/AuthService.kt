package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.user.AuthProvider
import kr.smiling.sportshub.domain.user.User
import kr.smiling.sportshub.domain.user.UserRepository
import kr.smiling.sportshub.dto.request.LoginRequest
import kr.smiling.sportshub.security.JwtTokenProvider
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class AuthResponse(val token: String, val userId: Long, val nickname: String)

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider
) {
    @Transactional
    fun loginOrRegister(request: LoginRequest): AuthResponse {
        val provider = AuthProvider.valueOf(request.provider.uppercase())
        val user = userRepository.findByProviderAndProviderId(provider, request.providerId)
            ?: userRepository.save(
                User(
                    email = request.email.ifBlank { null },
                    nickname = request.nickname,
                    profileImg = request.profileImg,
                    provider = provider,
                    providerId = request.providerId
                )
            )

        // 이메일이 나중에 들어오면 업데이트
        if (user.email == null && request.email.isNotBlank()) {
            user.email = request.email
        }

        val token = jwtTokenProvider.generateToken(user.id, user.email ?: "")
        return AuthResponse(token = token, userId = user.id, nickname = user.nickname)
    }
}
