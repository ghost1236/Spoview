-- 테스트 유저 (개발용)
INSERT INTO users (id, email, nickname, provider, provider_id, fan_level, created_at, updated_at) VALUES
(1, 'test@smiling.kr', '테스트유저', 'KAKAO', 'test-001', 1, NOW(), NOW());
