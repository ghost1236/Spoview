package kr.smiling.sportshub.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    val provider: String,
    val providerId: String,
    val email: String,
    val nickname: String,
    val profileImg: String? = null
)

data class SubscribeRequest(
    val teamCode: String
)

data class CreatePostRequest(
    @field:NotBlank val teamCode: String,
    @field:NotBlank @field:Size(max = 200) val title: String,
    @field:NotBlank val content: String,
    val category: String = "FREE",
    val imageIds: List<Long>? = null
)

data class UpdatePostRequest(
    @field:Size(max = 200) val title: String?,
    val content: String?,
    val category: String?
)

data class CreateCommentRequest(
    @field:NotBlank val content: String,
    val parentId: Long? = null
)