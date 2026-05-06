package kr.smiling.sportshub.domain.community

import kr.smiling.sportshub.domain.common.BaseEntity
import kr.smiling.sportshub.domain.team.Team
import kr.smiling.sportshub.domain.user.User
import jakarta.persistence.*

@Entity
@Table(name = "posts")
class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_code", nullable = false)
    val team: Team,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var category: PostCategory = PostCategory.FREE,

    @Column(nullable = false, length = 200)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(nullable = false)
    var likeCount: Int = 0,

    @Column(nullable = false)
    var viewCount: Int = 0
) : BaseEntity()

enum class PostCategory {
    FREE,
    REVIEW,
    TRANSFER
}
