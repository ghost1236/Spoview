package kr.smiling.sportshub.domain.community

import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

@Entity
@Table(name = "post_images")
class PostImage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    var post: Post? = null,

    @Column(nullable = false)
    val fileName: String,

    @Column(nullable = false, length = 500)
    val fileUrl: String,

    @Column(nullable = false)
    val fileSize: Long = 0,

    @Column(nullable = false)
    val displayOrder: Int = 0,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

interface PostImageRepository : JpaRepository<PostImage, Long> {
    fun findByPost_IdOrderByDisplayOrder(postId: Long): List<PostImage>
    fun findByIdIn(ids: List<Long>): List<PostImage>
}
