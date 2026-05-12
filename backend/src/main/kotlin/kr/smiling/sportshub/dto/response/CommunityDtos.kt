package kr.smiling.sportshub.dto.response

import kr.smiling.sportshub.domain.community.Comment
import kr.smiling.sportshub.domain.community.Post
import java.time.LocalDateTime

data class PostListResponse(
    val id: Long,
    val teamCode: String,
    val category: String,
    val title: String,
    val authorNickname: String,
    val authorFanLevel: Int,
    val likeCount: Int,
    val viewCount: Int,
    val commentCount: Long,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(post: Post, commentCount: Long = 0) = PostListResponse(
            id = post.id,
            teamCode = post.team.teamCode,
            category = post.category.name,
            title = post.title,
            authorNickname = post.user.nickname,
            authorFanLevel = post.user.fanLevel,
            likeCount = post.likeCount,
            viewCount = post.viewCount,
            commentCount = commentCount,
            createdAt = post.createdAt
        )
    }
}

data class PostImageResponse(
    val id: Long,
    val url: String,
    val fileName: String
)

data class PostDetailResponse(
    val id: Long,
    val teamCode: String,
    val category: String,
    val title: String,
    val content: String,
    val authorId: Long,
    val authorNickname: String,
    val authorProfileImg: String?,
    val authorFanLevel: Int,
    val likeCount: Int,
    val viewCount: Int,
    val isLiked: Boolean,
    val images: List<PostImageResponse>,
    val comments: List<CommentResponse>,
    val createdAt: LocalDateTime
)

data class CommentResponse(
    val id: Long,
    val content: String,
    val authorNickname: String,
    val authorProfileImg: String?,
    val authorFanLevel: Int,
    val likeCount: Int,
    val isLiked: Boolean,
    val replies: List<CommentResponse>,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(comment: Comment, isLiked: Boolean = false, replies: List<CommentResponse> = emptyList()) =
            CommentResponse(
                id = comment.id,
                content = comment.content,
                authorNickname = comment.user.nickname,
                authorProfileImg = comment.user.profileImg,
                authorFanLevel = comment.user.fanLevel,
                likeCount = comment.likeCount,
                isLiked = isLiked,
                replies = replies,
                createdAt = comment.createdAt
            )
    }
}