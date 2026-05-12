package kr.smiling.sportshub.domain.community

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface PostRepository : JpaRepository<Post, Long> {
    fun findByTeam_TeamCodeAndCategory(teamCode: String, category: PostCategory, pageable: Pageable): Page<Post>
    fun findByTeam_TeamCode(teamCode: String, pageable: Pageable): Page<Post>
    fun findByUser_Id(userId: Long, pageable: Pageable): Page<Post>
    fun findTop3ByTeam_TeamCodeOrderByLikeCountDesc(teamCode: String): List<Post>
}

interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByPost_IdAndParentIsNullOrderByCreatedAt(postId: Long): List<Comment>
    fun findByParent_Id(parentId: Long): List<Comment>
    fun countByPost_Id(postId: Long): Long
}

interface LikeRepository : JpaRepository<Like, Long> {
    fun findByUser_IdAndTargetTypeAndTargetId(userId: Long, targetType: TargetType, targetId: Long): Like?
    fun existsByUser_IdAndTargetTypeAndTargetId(userId: Long, targetType: TargetType, targetId: Long): Boolean
}

