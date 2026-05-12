-- ============================================
-- V1: 초기 스키마 생성
-- ============================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    profile_img VARCHAR(500),
    provider ENUM('KAKAO','NAVER','GOOGLE') NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    fan_level INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leagues (
    league_code VARCHAR(20) PRIMARY KEY,
    sport_type ENUM('FOOTBALL','BASEBALL') NOT NULL,
    name_ko VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    api_football_id INT,
    logo_url VARCHAR(500),
    season_year INT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teams (
    team_code VARCHAR(10) PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    sport_type ENUM('FOOTBALL','BASEBALL') NOT NULL,
    name_ko VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    logo_url VARCHAR(500),
    api_football_id INT,
    mlb_team_id INT,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    INDEX idx_league (league_code),
    INDEX idx_sport (sport_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_team_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    team_code VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    UNIQUE KEY uk_user_team (user_id, team_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    sport_type ENUM('FOOTBALL','BASEBALL') NOT NULL,
    home_team_code VARCHAR(10) NOT NULL,
    away_team_code VARCHAR(10) NOT NULL,
    match_date DATETIME NOT NULL,
    home_score INT,
    away_score INT,
    status ENUM('SCHEDULED','LIVE','FINISHED','POSTPONED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    round VARCHAR(50),
    venue VARCHAR(100),
    api_match_id VARCHAR(20),
    extra_data JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    FOREIGN KEY (home_team_code) REFERENCES teams(team_code),
    FOREIGN KEY (away_team_code) REFERENCES teams(team_code),
    INDEX idx_league_date (league_code, match_date),
    INDEX idx_team_date (home_team_code, match_date),
    INDEX idx_status (status),
    INDEX idx_api_match (api_match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE standings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    team_code VARCHAR(10) NOT NULL,
    season_year INT NOT NULL,
    rank_position INT NOT NULL,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_diff INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    winning_pct VARCHAR(10),
    games_back VARCHAR(10),
    form VARCHAR(10),
    zone_description VARCHAR(100),
    division VARCHAR(50),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (league_code) REFERENCES leagues(league_code),
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    UNIQUE KEY uk_league_team_season (league_code, team_code, season_year),
    INDEX idx_league_season_rank (league_code, season_year, rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code VARCHAR(10) NOT NULL,
    user_id BIGINT NOT NULL,
    category ENUM('FREE','REVIEW','TRANSFER') NOT NULL DEFAULT 'FREE',
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_code) REFERENCES teams(team_code),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_team_category (team_code, category),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type ENUM('POST','COMMENT') NOT NULL,
    target_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_user_target (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE match_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    prediction ENUM('HOME','DRAW','AWAY') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_match_user (match_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE api_usage_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_source VARCHAR(30) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    request_date DATE NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    last_called_at DATETIME NOT NULL,
    UNIQUE KEY uk_source_date (api_source, request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
