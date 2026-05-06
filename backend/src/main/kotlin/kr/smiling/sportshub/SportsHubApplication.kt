package kr.smiling.sportshub

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class SportsHubApplication

fun main(args: Array<String>) {
    runApplication<SportsHubApplication>(*args)
}
