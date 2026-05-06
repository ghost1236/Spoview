package kr.smiling.sportshub.domain.user

import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByProviderAndProviderId(provider: AuthProvider, providerId: String): User?
    fun findByEmail(email: String): User?
}

interface UserTeamSubscriptionRepository : JpaRepository<UserTeamSubscription, Long> {
    fun findByUser_Id(userId: Long): List<UserTeamSubscription>
    fun findByUser_IdAndTeam_TeamCode(userId: Long, teamCode: String): UserTeamSubscription?
    fun deleteByUser_IdAndTeam_TeamCode(userId: Long, teamCode: String)
    fun existsByUser_IdAndTeam_TeamCode(userId: Long, teamCode: String): Boolean
}
