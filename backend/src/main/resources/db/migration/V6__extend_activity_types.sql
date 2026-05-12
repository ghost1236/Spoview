-- ============================================
-- V6: 포인트 활동 타입 확장 + totalPoints 컬럼
-- ============================================

-- 유저 테이블에 총 포인트 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INT NOT NULL DEFAULT 0;

-- fan_activities 테이블의 activity_type ENUM 확장
ALTER TABLE fan_activities MODIFY COLUMN activity_type
    ENUM('POST','COMMENT','LIKE','PREDICTION','LOGIN','SIGNUP','LOGIN_STREAK','LIKE_MILESTONE','FIRST_POST','TEAM_SUBSCRIBE','MATCH_CHECKIN') NOT NULL;
