-- 경기 예측 기능 삭제
DROP TABLE IF EXISTS match_predictions;

-- fan_activities에서 PREDICTION 타입 제거 (ENUM 변경은 불필요 - 데이터만 삭제)
DELETE FROM fan_activities WHERE activity_type = 'PREDICTION';
