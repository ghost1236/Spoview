package kr.smiling.sportshub.service

import kr.smiling.sportshub.domain.community.*
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.domain.user.ActivityType
import kr.smiling.sportshub.domain.user.UserRepository
import kr.smiling.sportshub.dto.request.CreateCommentRequest
import kr.smiling.sportshub.dto.request.CreatePostRequest
import kr.smiling.sportshub.dto.request.UpdatePostRequest
import kr.smiling.sportshub.dto.response.CommentResponse
import kr.smiling.sportshub.dto.response.PostDetailResponse
import kr.smiling.sportshub.dto.response.PostImageResponse
import kr.smiling.sportshub.dto.response.PostListResponse
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PostService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val likeRepository: LikeRepository,
    private val userRepository: UserRepository,
    private val teamRepository: TeamRepository,
    private val postImageRepository: PostImageRepository,
    private val fanLevelService: FanLevelService
) {
    @Transactional(readOnly = true)
    fun getPosts(teamCode: String, category: String?, pageable: Pageable): Page<PostListResponse> {
        val posts = if (category != null) {
            postRepository.findByTeam_TeamCodeAndCategory(teamCode, PostCategory.valueOf(category.uppercase()), pageable)
        } else {
            postRepository.findByTeam_TeamCode(teamCode, pageable)
        }
        return posts.map { post ->
            val commentCount = commentRepository.countByPost_Id(post.id)
            PostListResponse.from(post, commentCount)
        }
    }

    @Transactional
    fun getPostDetail(postId: Long, userId: Long?): PostDetailResponse {
        val post = postRepository.findById(postId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        post.viewCount++

        val isLiked = userId?.let {
            likeRepository.existsByUser_IdAndTargetTypeAndTargetId(it, TargetType.POST, postId)
        } ?: false

        val topComments = commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAt(postId)
        val comments = topComments.map { comment ->
            val replies = commentRepository.findByParent_Id(comment.id).map { reply ->
                val replyLiked = userId?.let {
                    likeRepository.existsByUser_IdAndTargetTypeAndTargetId(it, TargetType.COMMENT, reply.id)
                } ?: false
                CommentResponse.from(reply, replyLiked)
            }
            val commentLiked = userId?.let {
                likeRepository.existsByUser_IdAndTargetTypeAndTargetId(it, TargetType.COMMENT, comment.id)
            } ?: false
            CommentResponse.from(comment, commentLiked, replies)
        }

        val images = postImageRepository.findByPost_IdOrderByDisplayOrder(postId)
            .map { PostImageResponse(id = it.id, url = it.fileUrl, fileName = it.fileName) }

        return PostDetailResponse(
            id = post.id,
            teamCode = post.team.teamCode,
            category = post.category.name,
            title = post.title,
            content = post.content,
            authorId = post.user.id,
            authorNickname = post.user.nickname,
            authorProfileImg = post.user.profileImg,
            likeCount = post.likeCount,
            viewCount = post.viewCount,
            isLiked = isLiked,
            images = images,
            comments = comments,
            createdAt = post.createdAt
        )
    }

    @Transactional
    fun createPost(userId: Long, request: CreatePostRequest): Long {
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
        val team = teamRepository.findByTeamCode(request.teamCode) ?: throw BusinessException(ErrorCode.TEAM_NOT_FOUND)

        val post = postRepository.save(Post(
            team = team,
            user = user,
            category = PostCategory.valueOf(request.category.uppercase()),
            title = request.title,
            content = request.content
        ))

        // 이미지 연결
        request.imageIds?.let { ids ->
            val images = postImageRepository.findByIdIn(ids)
            images.forEach { it.post = post }
        }

        fanLevelService.recordActivity(userId, ActivityType.POST)
        return post.id
    }

    @Transactional
    fun updatePost(postId: Long, userId: Long, request: UpdatePostRequest) {
        val post = postRepository.findById(postId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        if (post.user.id != userId) throw BusinessException(ErrorCode.FORBIDDEN)

        request.title?.let { post.title = it }
        request.content?.let { post.content = it }
        request.category?.let { post.category = PostCategory.valueOf(it.uppercase()) }
    }

    @Transactional
    fun deletePost(postId: Long, userId: Long) {
        val post = postRepository.findById(postId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        if (post.user.id != userId) throw BusinessException(ErrorCode.FORBIDDEN)
        postRepository.delete(post)
    }

    @Transactional
    fun toggleLike(userId: Long, postId: Long): Boolean {
        val existing = likeRepository.findByUser_IdAndTargetTypeAndTargetId(userId, TargetType.POST, postId)
        val post = postRepository.findById(postId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }

        return if (existing != null) {
            likeRepository.delete(existing)
            post.likeCount = maxOf(0, post.likeCount - 1)
            false
        } else {
            val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
            likeRepository.save(Like(user = user, targetType = TargetType.POST, targetId = postId))
            post.likeCount++
            fanLevelService.recordActivity(userId, ActivityType.LIKE)
            true
        }
    }

    @Transactional
    fun createComment(postId: Long, userId: Long, request: CreateCommentRequest): Long {
        val post = postRepository.findById(postId).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        val user = userRepository.findById(userId).orElseThrow { BusinessException(ErrorCode.USER_NOT_FOUND) }
        val parent = request.parentId?.let {
            commentRepository.findById(it).orElseThrow { BusinessException(ErrorCode.POST_NOT_FOUND) }
        }

        val comment = commentRepository.save(Comment(
            post = post,
            user = user,
            parent = parent,
            content = request.content
        ))
        fanLevelService.recordActivity(userId, ActivityType.COMMENT)
        return comment.id
    }

    @Transactional(readOnly = true)
    fun getTopPosts(teamCode: String): List<PostListResponse> {
        return postRepository.findTop3ByTeam_TeamCodeOrderByLikeCountDesc(teamCode)
            .map { PostListResponse.from(it) }
    }
}
