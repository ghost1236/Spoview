package kr.smiling.sportshub.controller

import kr.smiling.sportshub.dto.request.PredictRequest
import kr.smiling.sportshub.dto.response.PredictionResponse
import kr.smiling.sportshub.service.PredictionService
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/matches")
class PredictionController(private val predictionService: PredictionService) {

    @GetMapping("/{matchId}/prediction")
    fun getPrediction(
        @PathVariable matchId: Long,
        auth: Authentication?
    ): PredictionResponse {
        val userId = auth?.principal as? Long
        return predictionService.getPrediction(matchId, userId)
    }

    @PostMapping("/{matchId}/prediction")
    @ResponseStatus(HttpStatus.CREATED)
    fun predict(
        @PathVariable matchId: Long,
        auth: Authentication,
        @RequestBody request: PredictRequest
    ) {
        val userId = auth.principal as Long
        predictionService.predict(matchId, userId, request.prediction)
    }
}
