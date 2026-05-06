package kr.smiling.sportshub.controller

import jakarta.validation.Valid
import kr.smiling.sportshub.dto.request.CreateCommentRequest
import kr.smiling.sportshub.dto.request.CreatePostRequest
import kr.smiling.sportshub.dto.request.UpdatePostRequest
import kr.smiling.sportshub.dto.response.PostDetailResponse
import kr.smiling.sportshub.dto.response.PostListResponse
import kr.smiling.sportshub.service.PostService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/posts")
class PostController(private val postService: PostService) {

    @GetMapping
    fun getPosts(
        @RequestParam teamCode: String,
        @RequestParam(required = false) category: String?,
        @PageableDefault(size = 20) pageable: Pageable
    ): Page<PostListResponse> = postService.getPosts(teamCode, category, pageable)

    @GetMapping("/{postId}")
    fun getPostDetail(
        @PathVariable postId: Long,
        auth: Authentication?
    ): PostDetailResponse {
        val userId = auth?.principal as? Long
        return postService.getPostDetail(postId, userId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createPost(
        auth: Authentication,
        @Valid @RequestBody request: CreatePostRequest
    ): Map<String, Long> {
        val userId = auth.principal as Long
        val postId = postService.createPost(userId, request)
        return mapOf("id" to postId)
    }

    @PutMapping("/{postId}")
    fun updatePost(
        @PathVariable postId: Long,
        auth: Authentication,
        @RequestBody request: UpdatePostRequest
    ) {
        val userId = auth.principal as Long
        postService.updatePost(postId, userId, request)
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deletePost(@PathVariable postId: Long, auth: Authentication) {
        val userId = auth.principal as Long
        postService.deletePost(postId, userId)
    }

    @PostMapping("/{postId}/likes")
    fun toggleLike(@PathVariable postId: Long, auth: Authentication): Map<String, Boolean> {
        val userId = auth.principal as Long
        val liked = postService.toggleLike(userId, postId)
        return mapOf("liked" to liked)
    }

    @PostMapping("/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    fun createComment(
        @PathVariable postId: Long,
        auth: Authentication,
        @Valid @RequestBody request: CreateCommentRequest
    ): Map<String, Long> {
        val userId = auth.principal as Long
        val commentId = postService.createComment(postId, userId, request)
        return mapOf("id" to commentId)
    }
}
