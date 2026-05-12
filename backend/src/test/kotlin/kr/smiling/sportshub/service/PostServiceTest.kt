package kr.smiling.sportshub.service

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import kr.smiling.sportshub.domain.common.SportType
import kr.smiling.sportshub.domain.community.*
import kr.smiling.sportshub.domain.team.League
import kr.smiling.sportshub.domain.team.Team
import kr.smiling.sportshub.domain.team.TeamRepository
import kr.smiling.sportshub.domain.user.*
import kr.smiling.sportshub.dto.request.CreateCommentRequest
import kr.smiling.sportshub.dto.request.CreatePostRequest
import kr.smiling.sportshub.dto.request.UpdatePostRequest
import kr.smiling.sportshub.exception.BusinessException
import kr.smiling.sportshub.exception.ErrorCode
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.util.*

@ExtendWith(MockKExtension::class)
class PostServiceTest {

    @MockK
    private lateinit var postRepository: PostRepository

    @MockK
    private lateinit var commentRepository: CommentRepository

    @MockK
    private lateinit var likeRepository: LikeRepository

    @MockK
    private lateinit var userRepository: UserRepository

    @MockK
    private lateinit var teamRepository: TeamRepository

    @MockK
    private lateinit var postImageRepository: PostImageRepository

    @MockK
    private lateinit var fanLevelService: FanLevelService

    @InjectMockKs
    private lateinit var postService: PostService

    private lateinit var testUser: User
    private lateinit var testLeague: League
    private lateinit var testTeam: Team
    private lateinit var testPost: Post

    @BeforeEach
    fun setUp() {
        clearAllMocks()
        testUser = User(
            id = 1L,
            email = "test@example.com",
            nickname = "테스터",
            provider = AuthProvider.KAKAO,
            providerId = "12345"
        )
        testLeague = League(
            leagueCode = "epl",
            sportType = SportType.FOOTBALL,
            nameKo = "프리미어리그",
            nameEn = "Premier League",
            country = "England",
            seasonYear = 2026
        )
        testTeam = Team(
            teamCode = "mci",
            league = testLeague,
            sportType = SportType.FOOTBALL,
            nameKo = "맨체스터 시티",
            nameEn = "Manchester City"
        )
        testPost = Post(
            id = 1L,
            team = testTeam,
            user = testUser,
            category = PostCategory.FREE,
            title = "테스트 게시글",
            content = "테스트 내용"
        )
    }

    @Test
    fun `TC-011 게시글 작성 성공`() {
        // Arrange
        val request = CreatePostRequest(
            teamCode = "mci",
            title = "테스트 게시글",
            content = "테스트 내용",
            category = "FREE"
        )
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { teamRepository.findByTeamCode("mci") } returns testTeam
        every { postRepository.save(any()) } returns testPost
        every { fanLevelService.recordActivity(1L, ActivityType.POST) } just Runs
        every { fanLevelService.checkFirstPost(1L) } just Runs

        // Act
        val result = postService.createPost(1L, request)

        // Assert
        assertEquals(1L, result)
        verify(exactly = 1) { postRepository.save(any()) }
        verify(exactly = 1) { fanLevelService.recordActivity(1L, ActivityType.POST) }
        verify(exactly = 1) { fanLevelService.checkFirstPost(1L) }
    }

    @Test
    fun `TC-012 이미지 첨부 게시글 작성`() {
        // Arrange
        val request = CreatePostRequest(
            teamCode = "mci",
            title = "사진 게시글",
            content = "사진 첨부",
            category = "FREE",
            imageIds = listOf(10L, 11L)
        )
        val image1 = PostImage(id = 10L, fileName = "img1.jpg", fileUrl = "https://storage/img1.jpg")
        val image2 = PostImage(id = 11L, fileName = "img2.jpg", fileUrl = "https://storage/img2.jpg")

        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { teamRepository.findByTeamCode("mci") } returns testTeam
        every { postRepository.save(any()) } returns testPost
        every { postImageRepository.findByIdIn(listOf(10L, 11L)) } returns listOf(image1, image2)
        every { fanLevelService.recordActivity(1L, ActivityType.POST) } just Runs
        every { fanLevelService.checkFirstPost(1L) } just Runs

        // Act
        val result = postService.createPost(1L, request)

        // Assert
        assertEquals(1L, result)
        verify(exactly = 1) { postImageRepository.findByIdIn(listOf(10L, 11L)) }
        assertEquals(testPost, image1.post)
        assertEquals(testPost, image2.post)
    }

    @Test
    fun `TC-013 존재하지 않는 유저로 게시글 작성 시 USER_NOT_FOUND 예외`() {
        // Arrange
        val request = CreatePostRequest(
            teamCode = "mci",
            title = "테스트",
            content = "내용"
        )
        every { userRepository.findById(999L) } returns Optional.empty()

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            postService.createPost(999L, request)
        }
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.errorCode)
    }

    @Test
    fun `TC-014 게시글 수정 성공`() {
        // Arrange
        val request = UpdatePostRequest(title = "수정된 제목", content = "수정된 내용", category = null)
        every { postRepository.findById(1L) } returns Optional.of(testPost)

        // Act
        postService.updatePost(1L, 1L, request)

        // Assert
        assertEquals("수정된 제목", testPost.title)
        assertEquals("수정된 내용", testPost.content)
    }

    @Test
    fun `TC-015 타인의 게시글 수정 시 FORBIDDEN 예외`() {
        // Arrange
        val request = UpdatePostRequest(title = "수정", content = null, category = null)
        every { postRepository.findById(1L) } returns Optional.of(testPost)

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            postService.updatePost(1L, 999L, request)
        }
        assertEquals(ErrorCode.FORBIDDEN, exception.errorCode)
    }

    @Test
    fun `TC-016 게시글 삭제 성공`() {
        // Arrange
        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { postRepository.delete(testPost) } just Runs

        // Act
        postService.deletePost(1L, 1L)

        // Assert
        verify(exactly = 1) { postRepository.delete(testPost) }
    }

    @Test
    fun `TC-017 타인의 게시글 삭제 시 FORBIDDEN 예외`() {
        // Arrange
        every { postRepository.findById(1L) } returns Optional.of(testPost)

        // Act & Assert
        val exception = assertThrows<BusinessException> {
            postService.deletePost(1L, 999L)
        }
        assertEquals(ErrorCode.FORBIDDEN, exception.errorCode)
    }

    @Test
    fun `TC-018 좋아요 토글 - 좋아요 추가`() {
        // Arrange
        every { likeRepository.findByUser_IdAndTargetTypeAndTargetId(1L, TargetType.POST, 1L) } returns null
        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { likeRepository.save(any()) } returns Like(
            id = 1L, user = testUser, targetType = TargetType.POST, targetId = 1L
        )
        every { fanLevelService.recordActivity(1L, ActivityType.LIKE) } just Runs
        every { fanLevelService.checkLikeMilestone(1L, 1) } just Runs

        val initialLikeCount = testPost.likeCount

        // Act
        val result = postService.toggleLike(1L, 1L)

        // Assert
        assertTrue(result)
        assertEquals(initialLikeCount + 1, testPost.likeCount)
        verify(exactly = 1) { likeRepository.save(any()) }
        verify(exactly = 1) { fanLevelService.recordActivity(1L, ActivityType.LIKE) }
    }

    @Test
    fun `TC-019 좋아요 토글 - 좋아요 취소`() {
        // Arrange
        val existingLike = Like(id = 1L, user = testUser, targetType = TargetType.POST, targetId = 1L)
        testPost.likeCount = 5

        every { likeRepository.findByUser_IdAndTargetTypeAndTargetId(1L, TargetType.POST, 1L) } returns existingLike
        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { likeRepository.delete(existingLike) } just Runs

        // Act
        val result = postService.toggleLike(1L, 1L)

        // Assert
        assertFalse(result)
        assertEquals(4, testPost.likeCount)
        verify(exactly = 1) { likeRepository.delete(existingLike) }
        verify(exactly = 0) { fanLevelService.recordActivity(any(), any()) }
    }

    @Test
    fun `TC-020 댓글 작성 성공`() {
        // Arrange
        val request = CreateCommentRequest(content = "댓글 내용")
        val savedComment = Comment(id = 1L, post = testPost, user = testUser, content = "댓글 내용")

        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { commentRepository.save(any()) } returns savedComment
        every { fanLevelService.recordActivity(1L, ActivityType.COMMENT) } just Runs

        // Act
        val result = postService.createComment(1L, 1L, request)

        // Assert
        assertEquals(1L, result)
        verify(exactly = 1) { commentRepository.save(any()) }
        verify(exactly = 1) { fanLevelService.recordActivity(1L, ActivityType.COMMENT) }
    }

    @Test
    fun `TC-021 대댓글 작성 성공`() {
        // Arrange
        val parentComment = Comment(id = 10L, post = testPost, user = testUser, content = "부모 댓글")
        val request = CreateCommentRequest(content = "대댓글 내용", parentId = 10L)
        val savedReply = Comment(id = 2L, post = testPost, user = testUser, parent = parentComment, content = "대댓글 내용")

        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { commentRepository.findById(10L) } returns Optional.of(parentComment)
        every { commentRepository.save(any()) } returns savedReply
        every { fanLevelService.recordActivity(1L, ActivityType.COMMENT) } just Runs

        // Act
        val result = postService.createComment(1L, 1L, request)

        // Assert
        assertEquals(2L, result)
        verify(exactly = 1) { commentRepository.findById(10L) }
    }

    @Test
    fun `TC-022 게시글 상세 조회 시 조회수 증가`() {
        // Arrange
        val initialViewCount = testPost.viewCount
        every { postRepository.findById(1L) } returns Optional.of(testPost)
        every { likeRepository.existsByUser_IdAndTargetTypeAndTargetId(1L, TargetType.POST, 1L) } returns false
        every { commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAt(1L) } returns emptyList()
        every { postImageRepository.findByPost_IdOrderByDisplayOrder(1L) } returns emptyList()

        // Act
        val result = postService.getPostDetail(1L, 1L)

        // Assert
        assertEquals(initialViewCount + 1, testPost.viewCount)
        assertEquals(1L, result.id)
        assertEquals("테스트 게시글", result.title)
        assertFalse(result.isLiked)
    }

    @Test
    fun `TC-023 게시글 목록 조회 카테고리 필터`() {
        // Arrange
        val pageable = org.springframework.data.domain.PageRequest.of(0, 10)
        val postPage = org.springframework.data.domain.PageImpl(listOf(testPost))

        every { postRepository.findByTeam_TeamCodeAndCategory("mci", PostCategory.FREE, pageable) } returns postPage
        every { commentRepository.countByPost_Id(1L) } returns 3L

        // Act
        val result = postService.getPosts("mci", "FREE", pageable)

        // Assert
        assertEquals(1, result.content.size)
        assertEquals("테스트 게시글", result.content[0].title)
        assertEquals(3L, result.content[0].commentCount)
    }
}
