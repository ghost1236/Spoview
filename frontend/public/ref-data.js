// Spoview - shared data fixtures (deterministic, no API)
(function(){
const LEAGUES = [
  { code: 'all',    nameKo: '전체',     color: 'var(--brand-primary)' },
  { code: 'epl',    nameKo: 'EPL',     color: '#3D195B' },
  { code: 'laliga', nameKo: '라리가',   color: '#EE3325' },
  { code: 'bundesliga', nameKo: '분데스리가', color: '#D20515' },
  { code: 'kleague', nameKo: 'K리그',  color: '#1F8A4D' },
  { code: 'kbo',    nameKo: 'KBO',    color: '#D72631' },
];

// Team logo placeholder: returns initials + color
const TEAMS = {
  // EPL
  mci: { code: 'mci', name: '맨체스터 시티', short: '맨시티',  league: 'epl', color: '#6CADDF', initial: 'MCI' },
  liv: { code: 'liv', name: '리버풀',       short: '리버풀',  league: 'epl', color: '#C8102E', initial: 'LIV' },
  ars: { code: 'ars', name: '아스널',       short: '아스널',  league: 'epl', color: '#EF0107', initial: 'ARS' },
  che: { code: 'che', name: '첼시',         short: '첼시',    league: 'epl', color: '#034694', initial: 'CHE' },
  tot: { code: 'tot', name: '토트넘',       short: '토트넘',  league: 'epl', color: '#132257', initial: 'TOT' },
  mun: { code: 'mun', name: '맨체스터 유나이티드', short: '맨유', league: 'epl', color: '#DA291C', initial: 'MUN' },
  new: { code: 'new', name: '뉴캐슬',       short: '뉴캐슬',  league: 'epl', color: '#241F20', initial: 'NEW' },
  bha: { code: 'bha', name: '브라이튼',     short: '브라이튼', league: 'epl', color: '#0057B8', initial: 'BHA' },

  // LaLiga
  rma: { code: 'rma', name: '레알 마드리드', short: '레알',     league: 'laliga', color: '#FEBE10', initial: 'RMA' },
  bar: { code: 'bar', name: 'FC 바르셀로나', short: '바르사',   league: 'laliga', color: '#A50044', initial: 'BAR' },
  atm: { code: 'atm', name: '아틀레티코',   short: '아틀레티코', league: 'laliga', color: '#CB3524', initial: 'ATM' },

  // Bundesliga
  bay: { code: 'bay', name: '바이에른 뮌헨', short: '바이에른',  league: 'bundesliga', color: '#DC052D', initial: 'BAY' },
  bvb: { code: 'bvb', name: '도르트문트',   short: '도르트문트', league: 'bundesliga', color: '#FDE100', initial: 'BVB' },

  // K리그
  ulsan: { code: 'ulsan', name: '울산 HD',     short: '울산',     league: 'kleague', color: '#1F4099', initial: '울산' },
  jeonbuk:{ code: 'jeonbuk',name: '전북 현대',  short: '전북',     league: 'kleague', color: '#16A34A', initial: '전북' },
  pohang: { code: 'pohang',name: '포항 스틸러스',short: '포항',     league: 'kleague', color: '#DC2626', initial: '포항' },
  fcseoul:{ code: 'fcseoul',name: 'FC 서울',   short: '서울',     league: 'kleague', color: '#DC2626', initial: '서울' },

  // KBO
  lgt:  { code: 'lgt',  name: 'LG 트윈스',   short: 'LG',      league: 'kbo', color: '#C30452', initial: 'LG' },
  doosan:{code: 'doosan',name: '두산 베어스',  short: '두산',     league: 'kbo', color: '#13284A', initial: '두산' },
  ssg:  { code: 'ssg',  name: 'SSG 랜더스',   short: 'SSG',     league: 'kbo', color: '#CE0E2D', initial: 'SSG' },
  kt:   { code: 'kt',   name: 'KT 위즈',     short: 'KT',      league: 'kbo', color: '#000000', initial: 'KT' },
  kia:  { code: 'kia',  name: 'KIA 타이거즈', short: 'KIA',     league: 'kbo', color: '#EA002C', initial: 'KIA' },
  samsung:{code:'samsung',name:'삼성 라이온즈',short: '삼성',     league: 'kbo', color: '#074CA1', initial: '삼성' },
  hanwha:{code:'hanwha',name:'한화 이글스',   short: '한화',     league: 'kbo', color: '#FF6600', initial: '한화' },
  lotte: { code: 'lotte',name:'롯데 자이언츠', short: '롯데',     league: 'kbo', color: '#041E42', initial: '롯데' },
  nc:   { code: 'nc',  name: 'NC 다이노스',  short: 'NC',      league: 'kbo', color: '#315288', initial: 'NC' },
  kiwoom:{code:'kiwoom',name:'키움 히어로즈', short: '키움',     league: 'kbo', color: '#570514', initial: '키움' },
};

// User's subscribed teams
const MY_TEAMS = ['tot', 'lgt', 'ulsan', 'rma'];

// Today/upcoming matches
const MATCHES = [
  { id: 1, league: 'epl', sport: 'football', home: 'tot', away: 'ars', date: '오늘 23:30', status: 'live', minute: "67'", homeScore: 2, awayScore: 1 },
  { id: 2, league: 'kbo', sport: 'baseball', home: 'lgt', away: 'doosan', date: '오늘 18:30', status: 'live', minute: '7회초', homeScore: 5, awayScore: 3 },
  { id: 3, league: 'kleague', sport: 'football', home: 'ulsan', away: 'jeonbuk', date: '오늘 19:30', status: 'scheduled' },
  { id: 4, league: 'laliga', sport: 'football', home: 'rma', away: 'bar', date: '내일 04:00', status: 'scheduled' },
  { id: 5, league: 'kbo', sport: 'baseball', home: 'kia', away: 'ssg', date: '어제', status: 'finished', homeScore: 7, awayScore: 4 },
  { id: 6, league: 'epl', sport: 'football', home: 'mci', away: 'liv', date: '어제', status: 'finished', homeScore: 2, awayScore: 2 },
  { id: 7, league: 'bundesliga', sport: 'football', home: 'bay', away: 'bvb', date: '5/8 토', status: 'scheduled' },
];

// Standings (EPL example)
const STANDINGS_EPL = [
  { rank: 1, team: 'liv', P: 35, W: 25, D: 7, L: 3, GF: 78, GA: 27, GD: 51, Pts: 82, form: 'WWWDW', zone: 'champions' },
  { rank: 2, team: 'ars', P: 35, W: 23, D: 8, L: 4, GF: 72, GA: 30, GD: 42, Pts: 77, form: 'WDWWL', zone: 'champions' },
  { rank: 3, team: 'mci', P: 35, W: 22, D: 7, L: 6, GF: 80, GA: 35, GD: 45, Pts: 73, form: 'WLWWD', zone: 'champions' },
  { rank: 4, team: 'che', P: 35, W: 20, D: 9, L: 6, GF: 65, GA: 38, GD: 27, Pts: 69, form: 'WWDLW', zone: 'champions' },
  { rank: 5, team: 'tot', P: 35, W: 19, D: 6, L: 10, GF: 70, GA: 50, GD: 20, Pts: 63, form: 'WLWDW', zone: 'europa', highlight: true },
  { rank: 6, team: 'new', P: 35, W: 17, D: 8, L: 10, GF: 60, GA: 45, GD: 15, Pts: 59, form: 'DWLWW', zone: 'europa' },
  { rank: 7, team: 'mun', P: 35, W: 15, D: 9, L: 11, GF: 55, GA: 50, GD: 5, Pts: 54, form: 'LDWWL', zone: 'conference' },
  { rank: 8, team: 'bha', P: 35, W: 14, D: 9, L: 12, GF: 52, GA: 50, GD: 2, Pts: 51, form: 'DWLDW' },
];

// KBO Standings
const STANDINGS_KBO = [
  { rank: 1, team: 'kia',     P: 40, W: 27, L: 12, T: 1, pct: '.692', gb: '-',   form: 'WWWLW' },
  { rank: 2, team: 'samsung', P: 40, W: 24, L: 15, T: 1, pct: '.615', gb: '3.0', form: 'WLWWW' },
  { rank: 3, team: 'lgt',     P: 40, W: 23, L: 16, T: 1, pct: '.590', gb: '4.0', form: 'WWLWD', highlight: true },
  { rank: 4, team: 'doosan',  P: 40, W: 22, L: 17, T: 1, pct: '.564', gb: '5.0', form: 'LWWLW' },
  { rank: 5, team: 'kt',      P: 40, W: 20, L: 19, T: 1, pct: '.513', gb: '7.0', form: 'WLLWW' },
  { rank: 6, team: 'ssg',     P: 40, W: 19, L: 20, T: 1, pct: '.487', gb: '8.0', form: 'LWLWL' },
  { rank: 7, team: 'nc',      P: 40, W: 18, L: 21, T: 1, pct: '.462', gb: '9.0', form: 'WLLWL' },
  { rank: 8, team: 'lotte',   P: 40, W: 17, L: 22, T: 1, pct: '.436', gb: '10.0',form: 'LLLWL' },
  { rank: 9, team: 'kiwoom',  P: 40, W: 15, L: 24, T: 1, pct: '.385', gb: '12.0',form: 'LLWLL' },
  { rank: 10,team: 'hanwha',  P: 40, W: 13, L: 26, T: 1, pct: '.333', gb: '14.0',form: 'LLLLW' },
];

// Recent 6 matches goal data for chart (Tottenham)
const TOT_RECENT = [
  { match: 'vs CHE', GF: 2, GA: 1 },
  { match: 'vs MUN', GF: 3, GA: 0 },
  { match: 'vs LIV', GF: 1, GA: 2 },
  { match: 'vs BHA', GF: 2, GA: 2 },
  { match: 'vs NEW', GF: 4, GA: 1 },
  { match: 'vs ARS', GF: 2, GA: 1 },
];

// Posts
const POSTS = [
  { id: 1, team: 'tot', author: '손흥민팬', avatar: '#7C3AED', category: 'review', title: '오늘 손흥민 헤트트릭 봤냐ㅋㅋㅋ 진짜 미쳤다', preview: '아스날 상대로 어떻게 그런 골을 넣지... 진짜 월클 인증', likes: 234, comments: 87, time: '2시간 전', hot: true },
  { id: 2, team: 'lgt', author: '잠실청년', avatar: '#DC2626', category: 'free', title: '오늘 잠실 직관 가시는 분 계신가요?', preview: '날씨도 좋고 두산전이라 분위기 좋을 거 같은데...', likes: 56, comments: 23, time: '3시간 전' },
  { id: 3, team: 'rma', author: '베르나베우', avatar: '#FEBE10', category: 'transfer', title: '음바페 + 비니시우스 듀오 너무 좋다', preview: '엘 클라시코 기대됨. 바르사 미드필드 약점 노릴 수 있을듯', likes: 189, comments: 134, time: '5시간 전', hot: true },
  { id: 4, team: 'ulsan', author: '울산호', avatar: '#1F4099', category: 'review', title: '전북전 프리뷰 - 우리 수비 라인 점검', preview: '최근 5경기 무패 행진 중인데 전북 공격진 막을 수 있을지', likes: 42, comments: 18, time: '7시간 전' },
  { id: 5, team: 'tot', author: '손케라인', avatar: '#16A34A', category: 'free', title: '매디슨 부상 회복 어느정도 됐을까', preview: '벤탕쿠르랑 매디슨 라인 빨리 봤으면', likes: 78, comments: 45, time: '하루 전' },
];

// Team stats radar (Tottenham vs league avg)
const TOT_RADAR = [
  { axis: '득점', team: 88, avg: 60 },
  { axis: '점유율', team: 72, avg: 55 },
  { axis: '슈팅', team: 78, avg: 60 },
  { axis: '수비', team: 55, avg: 60 },
  { axis: '패스성공', team: 82, avg: 70 },
  { axis: '세트피스', team: 70, avg: 60 },
];

// Cumulative goal differential (last 10 matches) — per my-team
const TREND_LAST10 = {
  tot:   [ 1,  2,  0, -1,  1,  3,  2,  1,  4,  3 ],   // 골 차 누적
  rma:   [ 2,  4,  6,  5,  7,  9, 11, 10, 13, 15 ],
  lgt:   [-1,  0, -2, -1,  1,  3,  2,  4,  3,  5 ],
  ulsan: [ 0,  1,  3,  2,  4,  3,  5,  6,  5,  7 ],
};

// Home / Away splits per my-team (current season)
const SPLITS = {
  tot:   { home: { W:11, D:3, L:4 }, away: { W:8,  D:3, L:6 } },
  rma:   { home: { W:14, D:2, L:1 }, away: { W:11, D:4, L:2 } },
  lgt:   { home: { W:13, D:0, L:7 }, away: { W:10, D:1, L:9 } },
  ulsan: { home: { W:9,  D:4, L:3 }, away: { W:7,  D:3, L:5 } },
};

// Top scorers — my-team players only
const TOP_SCORERS = [
  { name: '손흥민',   team: 'tot',   goals: 18, assists: 8,  trend: [1,1,2,1,3,2,1,3,2,2], pos: 'FW' },
  { name: '비니시우스', team: 'rma',   goals: 22, assists: 11, trend: [2,1,3,2,1,4,3,2,2,2], pos: 'FW' },
  { name: '음바페',    team: 'rma',   goals: 24, assists: 7,  trend: [3,2,1,4,2,3,2,3,2,2], pos: 'FW' },
  { name: '오스틴',    team: 'lgt',   goals: 12, assists: 0,  trend: [0,1,2,1,1,2,1,1,2,1], pos: 'BAT', stat: 'HR' },
  { name: '엄원상',    team: 'ulsan', goals: 8,  assists: 6,  trend: [0,1,1,2,1,1,0,1,1,0], pos: 'FW' },
];

// Transfer market activity (window: 진행 중)
const TRANSFERS = [
  { team: 'tot',   type: 'in',  player: '엔드릭',     from: '팔메이라스',  fee: '€55M' },
  { team: 'rma',   type: 'in',  player: '알폰소 데이비스', from: '바이에른',    fee: 'Free' },
  { team: 'tot',   type: 'out', player: '아르네 마이어',   to:   '아약스',      fee: '€18M' },
  { team: 'lgt',   type: 'in',  player: '디트릭 엔스',   from: '키움',        fee: '계약 1년' },
  { team: 'ulsan', type: 'in',  player: '말컹',         from: '몽펠리에',    fee: '€2.5M' },
];

// User profile / activity
const USER = {
  name: '지훈',
  level: 7,
  point: 1240,
  pointToNext: 260,
  pointTotalNext: 1500,
  badges: ['손흥민팬', '잠실 단골', 'KBO 시즌권'],
  activity: { posts: 18, comments: 142, likes: 387, watched: 24 },
  streak: 12,  // 연속 출석
};

// Notifications digest
const NOTIFICATIONS = [
  { type: 'goal',     team: 'tot',   text: '손흥민 득점 · vs ARS', time: '방금', read: false },
  { type: 'lineup',   team: 'lgt',   text: '오늘 LG 선발 라인업 발표', time: '12분 전', read: false },
  { type: 'transfer', team: 'rma',   text: '레알 이적 시장 1건 업데이트', time: '1시간 전', read: false },
  { type: 'kickoff',  team: 'ulsan', text: '울산 vs 전북 경기 30분 후 시작', time: '2시간 전', read: true },
];

window.SpoviewData = { LEAGUES, TEAMS, MY_TEAMS, MATCHES, STANDINGS_EPL, STANDINGS_KBO, TOT_RECENT, POSTS, TOT_RADAR, TREND_LAST10, SPLITS, TOP_SCORERS, TRANSFERS, USER, NOTIFICATIONS };
})();
