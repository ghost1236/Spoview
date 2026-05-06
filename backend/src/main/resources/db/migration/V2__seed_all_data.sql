-- ============================================
-- V2: 전체 시드 데이터 (football-data.org tla 기준)
-- team_code = football-data.org tla 소문자 (충돌 시 접미사 추가)
-- ============================================

-- 리그 (9개)
INSERT INTO leagues (league_code, sport_type, name_ko, name_en, country, api_football_id, season_year, display_order) VALUES
('epl',        'FOOTBALL', '프리미어리그', 'Premier League', 'England',      39,   2025, 1),
('laliga',     'FOOTBALL', '라리가',       'La Liga',        'Spain',        140,  2025, 2),
('bundesliga', 'FOOTBALL', '분데스리가',   'Bundesliga',     'Germany',       78,  2025, 3),
('seriea',     'FOOTBALL', '세리에A',      'Serie A',        'Italy',        135,  2025, 4),
('ligue1',     'FOOTBALL', '리그앙',       'Ligue 1',        'France',        61,  2025, 5),
('kleague1',   'FOOTBALL', 'K리그1',       'K League 1',     'South Korea',  292,  2026, 6),
('kleague2',   'FOOTBALL', 'K리그2',       'K League 2',     'South Korea',  293,  2026, 7),
('kbo',        'BASEBALL', 'KBO',          'KBO League',     'South Korea',  NULL, 2026, 8),
('mlb',        'BASEBALL', 'MLB',          'MLB',            'USA',          NULL, 2026, 9);

-- ============================================
-- EPL 20팀 (tla: football-data.org 2025-26)
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('ars', 'epl', 'FOOTBALL', '아스널',         'Arsenal',             1),
('mci', 'epl', 'FOOTBALL', '맨시티',         'Manchester City',     2),
('mun', 'epl', 'FOOTBALL', '맨유',           'Manchester United',   3),
('liv', 'epl', 'FOOTBALL', '리버풀',         'Liverpool',           4),
('avl', 'epl', 'FOOTBALL', '아스턴 빌라',    'Aston Villa',         5),
('bou', 'epl', 'FOOTBALL', '본머스',         'AFC Bournemouth',     6),
('bre', 'epl', 'FOOTBALL', '브렌트포드',     'Brentford',           7),
('bha', 'epl', 'FOOTBALL', '브라이턴',       'Brighton',            8),
('che', 'epl', 'FOOTBALL', '첼시',           'Chelsea',             9),
('eve', 'epl', 'FOOTBALL', '에버턴',         'Everton',            10),
('ful', 'epl', 'FOOTBALL', '풀럼',           'Fulham',             11),
('sun', 'epl', 'FOOTBALL', '선더랜드',       'Sunderland',         12),
('new', 'epl', 'FOOTBALL', '뉴캐슬',         'Newcastle United',   13),
('lee', 'epl', 'FOOTBALL', '리즈',           'Leeds United',       14),
('cry', 'epl', 'FOOTBALL', '크리스탈 팰리스', 'Crystal Palace',     15),
('not', 'epl', 'FOOTBALL', '노팅엄',         'Nottingham Forest',  16),
('tot', 'epl', 'FOOTBALL', '토트넘',         'Tottenham',          17),
('whu', 'epl', 'FOOTBALL', '웨스트햄',       'West Ham United',    18),
('bur', 'epl', 'FOOTBALL', '번리',           'Burnley',            19),
('wol', 'epl', 'FOOTBALL', '울버햄프턴',     'Wolverhampton',      20);

-- ============================================
-- 라리가 20팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('fcb', 'laliga', 'FOOTBALL', '바르셀로나',      'Barcelona',         1),
('rma', 'laliga', 'FOOTBALL', '레알 마드리드',    'Real Madrid',       2),
('vil', 'laliga', 'FOOTBALL', '비야레알',        'Villarreal',         3),
('atm', 'laliga', 'FOOTBALL', '아틀레티코',      'Atletico Madrid',    4),
('bet', 'laliga', 'FOOTBALL', '베티스',          'Real Betis',         5),
('cel', 'laliga', 'FOOTBALL', '셀타',            'Celta Vigo',         6),
('get', 'laliga', 'FOOTBALL', '헤타페',          'Getafe',             7),
('ath', 'laliga', 'FOOTBALL', '아틀레틱',        'Athletic Bilbao',    8),
('rso', 'laliga', 'FOOTBALL', '레알 소시에다드',  'Real Sociedad',      9),
('osa', 'laliga', 'FOOTBALL', '오사수나',        'Osasuna',           10),
('ray', 'laliga', 'FOOTBALL', '라요',            'Rayo Vallecano',    11),
('val', 'laliga', 'FOOTBALL', '발렌시아',        'Valencia',          12),
('esp', 'laliga', 'FOOTBALL', '에스파뇰',        'Espanyol',          13),
('elc', 'laliga', 'FOOTBALL', '엘체',            'Elche',             14),
('mal', 'laliga', 'FOOTBALL', '마요르카',        'Mallorca',          15),
('gir', 'laliga', 'FOOTBALL', '지로나',          'Girona',            16),
('sev', 'laliga', 'FOOTBALL', '세비야',          'Sevilla',           17),
('ala', 'laliga', 'FOOTBALL', '알라베스',        'Alaves',            18),
('lev', 'laliga', 'FOOTBALL', '레반테',          'Levante',           19),
('ovi', 'laliga', 'FOOTBALL', '오비에도',        'Real Oviedo',       20);

-- ============================================
-- 분데스리가 18팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('fcb2','bundesliga', 'FOOTBALL', '바이에른',       'Bayern Munich',         1),
('bvb', 'bundesliga', 'FOOTBALL', '도르트문트',     'Borussia Dortmund',     2),
('rbl', 'bundesliga', 'FOOTBALL', '라이프치히',     'RB Leipzig',            3),
('b04', 'bundesliga', 'FOOTBALL', '레버쿠젠',       'Bayer Leverkusen',      4),
('vfb', 'bundesliga', 'FOOTBALL', '슈투트가르트',   'VfB Stuttgart',         5),
('tsg', 'bundesliga', 'FOOTBALL', '호펜하임',       'TSG Hoffenheim',        6),
('scf', 'bundesliga', 'FOOTBALL', '프라이부르크',   'SC Freiburg',           7),
('sge', 'bundesliga', 'FOOTBALL', '프랑크푸르트',   'Eintracht Frankfurt',   8),
('fca', 'bundesliga', 'FOOTBALL', '아우크스부르크', 'FC Augsburg',           9),
('m05', 'bundesliga', 'FOOTBALL', '마인츠',         'FSV Mainz 05',         10),
('bmg', 'bundesliga', 'FOOTBALL', '묀헨글라트바흐', 'Borussia M.Gladbach',  11),
('hsv', 'bundesliga', 'FOOTBALL', 'HSV',            'Hamburger SV',         12),
('unb', 'bundesliga', 'FOOTBALL', '우니온 베를린', 'Union Berlin',          13),
('koe', 'bundesliga', 'FOOTBALL', '쾰른',           '1. FC Köln',           14),
('svw', 'bundesliga', 'FOOTBALL', '브레멘',         'Werder Bremen',        15),
('wob', 'bundesliga', 'FOOTBALL', '볼프스부르크',   'VfL Wolfsburg',        16),
('stp', 'bundesliga', 'FOOTBALL', '장크트파울리',   'FC St. Pauli',         17),
('hei', 'bundesliga', 'FOOTBALL', '하이덴하임',     'FC Heidenheim',        18);

-- ============================================
-- 세리에A 20팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('int', 'seriea', 'FOOTBALL', '인테르',       'Inter Milan',     1),
('nap', 'seriea', 'FOOTBALL', '나폴리',       'Napoli',          2),
('mil', 'seriea', 'FOOTBALL', 'AC밀란',       'AC Milan',        3),
('juv', 'seriea', 'FOOTBALL', '유벤투스',     'Juventus',        4),
('rom', 'seriea', 'FOOTBALL', 'AS로마',       'AS Roma',         5),
('com', 'seriea', 'FOOTBALL', '코모',         'Como 1907',       6),
('ata', 'seriea', 'FOOTBALL', '아탈란타',     'Atalanta',        7),
('laz', 'seriea', 'FOOTBALL', '라치오',       'Lazio',           8),
('bol', 'seriea', 'FOOTBALL', '볼로냐',       'Bologna',         9),
('sas', 'seriea', 'FOOTBALL', '사수올로',     'Sassuolo',       10),
('udi', 'seriea', 'FOOTBALL', '우디네세',     'Udinese',        11),
('par', 'seriea', 'FOOTBALL', '파르마',       'Parma',          12),
('tor', 'seriea', 'FOOTBALL', '토리노',       'Torino',         13),
('gen', 'seriea', 'FOOTBALL', '제노아',       'Genoa',          14),
('fio', 'seriea', 'FOOTBALL', '피오렌티나',   'Fiorentina',     15),
('cag', 'seriea', 'FOOTBALL', '칼리아리',     'Cagliari',       16),
('usl', 'seriea', 'FOOTBALL', '레체',         'Lecce',          17),
('cre', 'seriea', 'FOOTBALL', '크레모네세',   'Cremonese',      18),
('hve', 'seriea', 'FOOTBALL', '베로나',       'Hellas Verona',  19),
('pis', 'seriea', 'FOOTBALL', 'AC피사',       'AC Pisa',        20);

-- ============================================
-- 리그앙 18팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('psg', 'ligue1', 'FOOTBALL', 'PSG',            'Paris Saint-Germain',  1),
('rcl', 'ligue1', 'FOOTBALL', '랑스',            'RC Lens',              2),
('lyo', 'ligue1', 'FOOTBALL', '리옹',            'Olympique Lyon',       3),
('lil', 'ligue1', 'FOOTBALL', '릴',              'Lille',                4),
('ren', 'ligue1', 'FOOTBALL', '렌',              'Stade Rennais',        5),
('asm', 'ligue1', 'FOOTBALL', '모나코',          'AS Monaco',            6),
('mar', 'ligue1', 'FOOTBALL', '마르세유',        'Olympique Marseille',  7),
('rc',  'ligue1', 'FOOTBALL', '스트라스부르',    'RC Strasbourg',        8),
('fcl', 'ligue1', 'FOOTBALL', '로리앙',          'FC Lorient',           9),
('tou', 'ligue1', 'FOOTBALL', '툴루즈',          'Toulouse FC',         10),
('pfc', 'ligue1', 'FOOTBALL', '파리 FC',         'Paris FC',            11),
('bre2','ligue1', 'FOOTBALL', '브레스트',        'Stade Brestois',      12),
('ang', 'ligue1', 'FOOTBALL', '앙제',            'Angers SCO',          13),
('hac', 'ligue1', 'FOOTBALL', '르아브르',        'Le Havre AC',         14),
('nic', 'ligue1', 'FOOTBALL', '니스',            'OGC Nice',            15),
('aja', 'ligue1', 'FOOTBALL', '오세르',          'AJ Auxerre',          16),
('nan', 'ligue1', 'FOOTBALL', '낭트',            'FC Nantes',           17),
('fcm', 'ligue1', 'FOOTBALL', '메스',            'FC Metz',             18);

-- ============================================
-- K리그1 12팀 (2026시즌)
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('jun', 'kleague1', 'FOOTBALL', '전북 현대',        'Jeonbuk Hyundai',      1),
('usn', 'kleague1', 'FOOTBALL', '울산 HD',           'Ulsan HD FC',          2),
('phn', 'kleague1', 'FOOTBALL', '포항 스틸러스',     'Pohang Steelers',      3),
('fcs', 'kleague1', 'FOOTBALL', 'FC서울',            'FC Seoul',             4),
('gnm', 'kleague1', 'FOOTBALL', '강원 FC',           'Gangwon FC',           5),
('dae', 'kleague1', 'FOOTBALL', '대전 하나',         'Daejeon Hana Citizen', 6),
('gsn', 'kleague1', 'FOOTBALL', '김천 상무',         'Gimcheon Sangmu',      7),
('gjn', 'kleague1', 'FOOTBALL', '광주 FC',           'Gwangju FC',           8),
('ann', 'kleague1', 'FOOTBALL', 'FC안양',            'FC Anyang',            9),
('jej', 'kleague1', 'FOOTBALL', '제주 유나이티드',   'Jeju United',         10),
('inc', 'kleague1', 'FOOTBALL', '인천 유나이티드',   'Incheon United',      11),
('buc', 'kleague1', 'FOOTBALL', '부천 FC',           'Bucheon FC 1995',     12);

-- ============================================
-- K리그2 17팀 (2026시즌)
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('dgu', 'kleague2', 'FOOTBALL', '대구 FC',           'Daegu FC',             1),
('suw', 'kleague2', 'FOOTBALL', '수원 FC',           'Suwon FC',             2),
('swb', 'kleague2', 'FOOTBALL', '수원 삼성',         'Suwon Samsung',        3),
('sej', 'kleague2', 'FOOTBALL', '서울 이랜드',       'Seoul E-Land',         4),
('sgn', 'kleague2', 'FOOTBALL', '성남 FC',           'Seongnam FC',          5),
('jnm', 'kleague2', 'FOOTBALL', '전남 드래곤즈',     'Jeonnam Dragons',      6),
('gyg', 'kleague2', 'FOOTBALL', '김포 FC',           'Gimpo FC',             7),
('bus', 'kleague2', 'FOOTBALL', '부산 아이파크',     'Busan IPark',          8),
('cha', 'kleague2', 'FOOTBALL', '충남 아산',         'Chungnam Asan',        9),
('hws', 'kleague2', 'FOOTBALL', '화성 FC',           'Hwaseong FC',         10),
('chb', 'kleague2', 'FOOTBALL', '충북 청주',         'Chungbuk Cheongju',   11),
('chn', 'kleague2', 'FOOTBALL', '천안 시티',         'Cheonan City FC',     12),
('ans', 'kleague2', 'FOOTBALL', '안산 그리너스',     'Ansan Greeners',      13),
('gyn', 'kleague2', 'FOOTBALL', '경남 FC',           'Gyeongnam FC',        14),
('kmh', 'kleague2', 'FOOTBALL', '김해 FC',           'Gimhae FC 2008',      15),
('yng', 'kleague2', 'FOOTBALL', '용인 FC',           'Yongin FC',           16),
('paj', 'kleague2', 'FOOTBALL', '파주 프런티어',     'Paju Frontier FC',    17);

-- ============================================
-- KBO 10팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, display_order) VALUES
('ssg', 'kbo', 'BASEBALL', 'SSG 랜더스',       'SSG Landers',        1),
('kia', 'kbo', 'BASEBALL', 'KIA 타이거즈',     'KIA Tigers',         2),
('lgd', 'kbo', 'BASEBALL', 'LG 트윈스',        'LG Twins',           3),
('doo', 'kbo', 'BASEBALL', '두산 베어스',       'Doosan Bears',       4),
('ktu', 'kbo', 'BASEBALL', 'KT 위즈',          'KT Wiz',             5),
('sam', 'kbo', 'BASEBALL', '삼성 라이온즈',     'Samsung Lions',      6),
('lot', 'kbo', 'BASEBALL', '롯데 자이언츠',     'Lotte Giants',       7),
('han', 'kbo', 'BASEBALL', '한화 이글스',       'Hanwha Eagles',      8),
('nc',  'kbo', 'BASEBALL', 'NC 다이노스',       'NC Dinos',           9),
('kw',  'kbo', 'BASEBALL', '키움 히어로즈',     'Kiwoom Heroes',     10);

-- ============================================
-- MLB 30팀
-- ============================================
INSERT INTO teams (team_code, league_code, sport_type, name_ko, name_en, mlb_team_id, display_order) VALUES
('nyy', 'mlb', 'BASEBALL', '뉴욕 양키스',       'New York Yankees',       147,  1),
('bos', 'mlb', 'BASEBALL', '보스턴 레드삭스',   'Boston Red Sox',         111,  2),
('tbj', 'mlb', 'BASEBALL', '토론토 블루제이스', 'Toronto Blue Jays',      141,  3),
('bal', 'mlb', 'BASEBALL', '볼티모어 오리올스', 'Baltimore Orioles',      110,  4),
('tbr', 'mlb', 'BASEBALL', '탬파베이 레이스',   'Tampa Bay Rays',         139,  5),
('cle', 'mlb', 'BASEBALL', '클리블랜드 가디언스','Cleveland Guardians',   114,  6),
('det', 'mlb', 'BASEBALL', '디트로이트 타이거스','Detroit Tigers',         116,  7),
('min', 'mlb', 'BASEBALL', '미네소타 트윈스',   'Minnesota Twins',        142,  8),
('cws', 'mlb', 'BASEBALL', '시카고 화이트삭스', 'Chicago White Sox',      145,  9),
('kc',  'mlb', 'BASEBALL', '캔자스시티 로열스', 'Kansas City Royals',     118, 10),
('hou', 'mlb', 'BASEBALL', '휴스턴 애스트로스', 'Houston Astros',         117, 11),
('tex', 'mlb', 'BASEBALL', '텍사스 레인저스',   'Texas Rangers',          140, 12),
('sea', 'mlb', 'BASEBALL', '시애틀 매리너스',   'Seattle Mariners',       136, 13),
('laa', 'mlb', 'BASEBALL', 'LA 에인절스',       'Los Angeles Angels',     108, 14),
('oak', 'mlb', 'BASEBALL', '오클랜드 애슬레틱스','Oakland Athletics',      133, 15),
('atl', 'mlb', 'BASEBALL', '애틀랜타 브레이브스','Atlanta Braves',         144, 16),
('nym', 'mlb', 'BASEBALL', '뉴욕 메츠',         'New York Mets',          121, 17),
('phi', 'mlb', 'BASEBALL', '필라델피아 필리스', 'Philadelphia Phillies',  143, 18),
('mia', 'mlb', 'BASEBALL', '마이애미 말린스',   'Miami Marlins',          146, 19),
('was', 'mlb', 'BASEBALL', '워싱턴 내셔널스',   'Washington Nationals',   120, 20),
('chc', 'mlb', 'BASEBALL', '시카고 컵스',       'Chicago Cubs',           112, 21),
('mkb', 'mlb', 'BASEBALL', '밀워키 브루어스',   'Milwaukee Brewers',      158, 22),
('stl', 'mlb', 'BASEBALL', '세인트루이스 카디널스','St. Louis Cardinals',  138, 23),
('pit', 'mlb', 'BASEBALL', '피츠버그 파이러츠', 'Pittsburgh Pirates',     134, 24),
('cin', 'mlb', 'BASEBALL', '신시내티 레즈',     'Cincinnati Reds',        113, 25),
('lad', 'mlb', 'BASEBALL', 'LA 다저스',         'Los Angeles Dodgers',    119, 26),
('sdp', 'mlb', 'BASEBALL', '샌디에이고 파드리스','San Diego Padres',      135, 27),
('sfg', 'mlb', 'BASEBALL', '샌프란시스코 자이언츠','San Francisco Giants', 137, 28),
('ari', 'mlb', 'BASEBALL', '애리조나 다이아몬드백스','Arizona Diamondbacks',109, 29),
('col', 'mlb', 'BASEBALL', '콜로라도 로키스',   'Colorado Rockies',       115, 30);

-- ============================================
-- 팬 활동 추적 테이블
-- ============================================
CREATE TABLE fan_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type ENUM('POST','COMMENT','LIKE','PREDICTION','LOGIN') NOT NULL,
    points INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
