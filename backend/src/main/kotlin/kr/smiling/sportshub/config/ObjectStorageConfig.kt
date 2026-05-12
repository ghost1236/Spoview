package kr.smiling.sportshub.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@Configuration
class ObjectStorageConfig(
    @Value("\${ncloud.object-storage.endpoint:https://kr.object.ncloudstorage.com}") private val endpoint: String,
    @Value("\${ncloud.object-storage.access-key:}") private val accessKey: String,
    @Value("\${ncloud.object-storage.secret-key:}") private val secretKey: String,
    @Value("\${ncloud.object-storage.region:kr-standard}") private val region: String,
) {
    @Bean
    fun s3Client(): S3Client? {
        if (accessKey.isBlank() || secretKey.isBlank()) return null

        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                )
            )
            .forcePathStyle(true)
            .build()
    }
}
