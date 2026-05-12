package kr.smiling.sportshub.controller

import kr.smiling.sportshub.domain.community.PostImage
import kr.smiling.sportshub.domain.community.PostImageRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.ObjectCannedACL
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@RestController
@RequestMapping("/api/v1/images")
class ImageController(
    private val postImageRepository: PostImageRepository,
    private val s3Client: S3Client?,
    @Value("\${ncloud.object-storage.bucket:sportshub-images}") private val bucket: String,
    @Value("\${ncloud.object-storage.cdn-url:}") private val cdnUrl: String,
    @Value("\${ncloud.object-storage.endpoint:https://kr.object.ncloudstorage.com}") private val endpoint: String,
    @Value("\${sportshub.upload.path:./uploads}") private val uploadPath: String,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    fun upload(@RequestParam("file") file: MultipartFile): Map<String, Any> {
        val maxSize = 5 * 1024 * 1024L
        if (file.size > maxSize) {
            throw IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다")
        }

        val allowedTypes = setOf("image/jpeg", "image/png", "image/gif", "image/webp")
        if (file.contentType !in allowedTypes) {
            throw IllegalArgumentException("JPG, PNG, GIF, WebP 파일만 업로드 가능합니다")
        }

        val ext = file.originalFilename?.substringAfterLast(".", "jpg") ?: "jpg"
        val savedName = "${UUID.randomUUID()}.$ext"
        val fileUrl: String

        if (s3Client != null) {
            // Naver Cloud Object Storage
            val key = "images/$savedName"
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.contentType)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build(),
                RequestBody.fromInputStream(file.inputStream, file.size)
            )
            fileUrl = if (cdnUrl.isNotBlank()) "$cdnUrl/$key" else "$endpoint/$bucket/$key"
            log.info("이미지 업로드 (Object Storage): {}", fileUrl)
        } else {
            // 로컬 폴백
            val dir = Paths.get(uploadPath)
            if (!Files.exists(dir)) Files.createDirectories(dir)
            file.transferTo(dir.resolve(savedName).toFile())
            fileUrl = "/uploads/$savedName"
            log.info("이미지 업로드 (로컬): {}", fileUrl)
        }

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
