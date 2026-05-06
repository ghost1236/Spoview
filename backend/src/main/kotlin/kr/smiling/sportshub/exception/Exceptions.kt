package kr.smiling.sportshub.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

class BusinessException(
    val errorCode: ErrorCode,
    override val message: String = errorCode.message
) : RuntimeException(message)

enum class ErrorCode(val status: HttpStatus, val message: String) {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "팀을 찾을 수 없습니다"),
    LEAGUE_NOT_FOUND(HttpStatus.NOT_FOUND, "리그를 찾을 수 없습니다"),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다"),
    MATCH_NOT_FOUND(HttpStatus.NOT_FOUND, "경기를 찾을 수 없습니다"),
    ALREADY_SUBSCRIBED(HttpStatus.CONFLICT, "이미 구독한 팀입니다"),
    ALREADY_LIKED(HttpStatus.CONFLICT, "이미 좋아요를 눌렀습니다"),
    ALREADY_PREDICTED(HttpStatus.CONFLICT, "이미 예측에 참여했습니다"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다"),
    API_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "API 일일 한도를 초과했습니다"),
}

data class ErrorResponse(val code: String, val message: String)

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(e: BusinessException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(e.errorCode.status)
            .body(ErrorResponse(e.errorCode.name, e.message))
    }
}
