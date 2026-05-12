package kr.smiling.sportshub.security

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    private val mapper = ObjectMapper()

    // 인증이 필요 없는 경로
    private val publicPaths = listOf(
        "/api/v1/auth/",
        "/api/v1/admin/",
        "/actuator/health",
        "/uploads/"
    )

    // GET만 공개인 경로
    private val publicGetPaths = listOf(
        "/api/v1/teams",
        "/api/v1/leagues",
        "/api/v1/feed/today",
        "/api/v1/posts",
        "/api/v1/matches",
        "/api/v1/notifications/vapid-key"
    )

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val path = request.requestURI
        val method = request.method

        // 공개 경로는 토큰 검증 스킵
        if (isPublicPath(path, method)) {
            // 토큰이 있으면 파싱은 해줌 (선택적 인증)
            resolveToken(request)?.let { token ->
                if (jwtTokenProvider.validateToken(token)) {
                    setAuthentication(token)
                }
            }
            filterChain.doFilter(request, response)
            return
        }

        // 인증 필요 경로
        val token = resolveToken(request)
        if (token == null) {
            sendError(response, 401, "인증이 필요합니다")
            return
        }

        if (!jwtTokenProvider.validateToken(token)) {
            sendError(response, 401, "토큰이 만료되었거나 유효하지 않습니다")
            return
        }

        setAuthentication(token)
        filterChain.doFilter(request, response)
    }

    private fun isPublicPath(path: String, method: String): Boolean {
        // 완전 공개 경로
        if (publicPaths.any { path.startsWith(it) }) return true
        // GET만 공개인 경로
        if (method == "GET" && publicGetPaths.any { path.startsWith(it) }) return true
        return false
    }

    private fun setAuthentication(token: String) {
        val userId = jwtTokenProvider.getUserIdFromToken(token)
        val auth = UsernamePasswordAuthenticationToken(userId, null, emptyList())
        SecurityContextHolder.getContext().authentication = auth
    }

    private fun sendError(response: HttpServletResponse, status: Int, message: String) {
        response.status = status
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = "UTF-8"
        response.writer.write(mapper.writeValueAsString(mapOf("code" to "UNAUTHORIZED", "message" to message)))
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val bearer = request.getHeader("Authorization") ?: return null
        return if (bearer.startsWith("Bearer ")) bearer.substring(7) else null
    }
}
