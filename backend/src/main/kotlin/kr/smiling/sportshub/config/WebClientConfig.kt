package kr.smiling.sportshub.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig {

    @Bean("mlbWebClient")
    fun mlbWebClient(): WebClient {
        return WebClient.builder()
            .baseUrl("https://statsapi.mlb.com/api/v1")
            .build()
    }
}
