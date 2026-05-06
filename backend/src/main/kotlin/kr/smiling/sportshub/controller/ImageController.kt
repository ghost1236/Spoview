package kr.smiling.sportshub.controller

import kr.smiling.sportshub.domain.community.PostImage
import kr.smiling.sportshub.domain.community.PostImageRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

@RestController
@RequestMapping("/api/v1/images")
class ImageController(
    private val postImageRepository: PostImageRepository,
    @Value("\${sportshub.upload.path:./uploads}") private val uploadPath: String
) {
    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    fun upload(@RequestParam("file") file: MultipartFile): Map<String, Any> {
        val maxSize = 5 * 1024 * 1024L // 5MB
        if (file.size > maxSize) {
            throw IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다")
        }

        val allowedTypes = setOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (file.contentType !in allowedTypes) {
            throw IllegalArgumentException("JPG, PNG, GIF, WebP 파일만 업로드 가능합니다")
        }

        val dir = Paths.get(uploadPath)
        if (!Files.exists(dir)) Files.createDirectories(dir)

        val ext = file.originalFilename?.substringAfterLast(".", "jpg") ?: "jpg"
        val savedName = "${UUID.randomUUID()}.$ext"
        val filePath = dir.resolve(savedName)
        file.transferTo(filePath.toFile())

        val fileUrl = "/uploads/$savedName"

        val image = postImageRepository.save(PostImage(
            fileName = file.originalFilename ?: savedName,
            fileUrl = fileUrl,
            fileSize = file.size
        ))

        return mapOf(
            "id" to image.id,
            "url" to fileUrl,
            "fileName" to image.fileName,
            "fileSize" to image.fileSize
        )
    }
}
