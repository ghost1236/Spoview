package kr.smiling.sportshub.domain.team

import org.springframework.data.jpa.repository.JpaRepository

interface LeagueRepository : JpaRepository<League, String> {
    fun findAllByOrderByDisplayOrder(): List<League>
    fun findByLeagueCode(leagueCode: String): League?
}
