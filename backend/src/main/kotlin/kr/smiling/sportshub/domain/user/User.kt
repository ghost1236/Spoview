package kr.smiling.sportshub.domain.user

import kr.smiling.sportshub.domain.common.BaseEntity
import jakarta.persistence.*

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true)
    var email: String? = null,

    @Column(nullable = false, length = 50)
    var nickname: String,

    @Column(length = 500)
    var profileImg: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val provider: AuthProvider,

    @Column(nullable = false, length = 100)
    val providerId: String,

    @Column(nullable = false)
    var fanLevel: Int = 1,

    @Column(nullable = false)
    var totalPoints: Int = 0
) : BaseEntity()

enum class AuthProvider {
    KAKAO,
    NAVER,
    GOOGLE
}
