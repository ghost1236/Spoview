// 클라이언트에서는 항상 Next.js rewrites 프록시를 통해 호출 (CORS 회피)
// 서버 사이드(auth.ts)에서는 NEXT_PUBLIC_API_URL을 직접 사용
const BASE_URL = "";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/v1${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    const message = error?.message || `HTTP ${res.status} 요청 실패`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Teams / Leagues ───

export interface League {
  leagueCode: string;
  sportType: string;
  nameKo: string;
  nameEn: string;
  country: string;
  logoUrl: string | null;
  seasonYear: number;
}

export interface Team {
  teamCode: string;
  leagueCode: string;
  sportType: string;
  nameKo: string;
  nameEn: string;
  logoUrl: string | null;
}

export interface TeamDetail {
  team: Team;
  league: League;
}

export const getLeagues = () => fetchApi<League[]>("/leagues");
export const getTeams = (leagueCode?: string) =>
  fetchApi<Team[]>(`/teams${leagueCode ? `?leagueCode=${leagueCode}` : ""}`);
export const getTeamDetail = (code: string) => fetchApi<TeamDetail>(`/teams/${code}`);

// ─── Matches / Standings ───

export interface Match {
  id: number;
  leagueCode: string;
  sportType: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  round: string | null;
  venue: string | null;
}

export interface Standing {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  winningPct: string | null;
  gamesBack: string | null;
  form: string | null;
  zoneDescription: string | null;
  division: string | null;
}

export const getTeamMatches = (code: string, days?: number) =>
  fetchApi<Match[]>(`/teams/${code}/matches${days ? `?days=${days}` : ""}`);
export const getLeagueStandings = (code: string) =>
  fetchApi<Standing[]>(`/leagues/${code}/standings`);
export const getTodayMatches = () => fetchApi<Match[]>("/feed/today");
export const getFeed = (token: string) =>
  fetchApi<Match[]>("/feed", { token });

// ─── Subscriptions ───

export const getSubscriptions = (token: string) =>
  fetchApi<Team[]>("/subscriptions", { token });
export const subscribe = (token: string, teamCode: string) =>
  fetchApi<Team>("/subscriptions", {
    method: "POST",
    token,
    body: JSON.stringify({ teamCode }),
  });
export const unsubscribe = (token: string, teamCode: string) =>
  fetchApi<void>(`/subscriptions/${teamCode}`, { method: "DELETE", token });

// ─── Posts ───

export interface PostSummary {
  id: number;
  teamCode: string;
  category: string;
  title: string;
  authorNickname: string;
  authorFanLevel: number;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PostImage {
  id: number;
  url: string;
  fileName: string;
}

export interface PostDetail {
  id: number;
  teamCode: string;
  category: string;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  authorProfileImg: string | null;
  authorFanLevel: number;
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  images: PostImage[];
  comments: CommentData[];
  createdAt: string;
}

export interface CommentData {
  id: number;
  content: string;
  authorNickname: string;
  authorProfileImg: string | null;
  authorFanLevel: number;
  likeCount: number;
  isLiked: boolean;
  replies: CommentData[];
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const getPosts = (teamCode: string, category?: string, page = 0) =>
  fetchApi<PageResponse<PostSummary>>(
    `/posts?teamCode=${teamCode}${category ? `&category=${category}` : ""}&page=${page}&size=20`
  );
export const getPostDetail = (postId: number) =>
  fetchApi<PostDetail>(`/posts/${postId}`);
export const createPost = (token: string, data: { teamCode: string; title: string; content: string; category?: string; imageIds?: number[] }) =>
  fetchApi<{ id: number }>("/posts", { method: "POST", token, body: JSON.stringify(data) });

export const uploadImage = async (token: string, file: File): Promise<{ id: number; url: string; fileName: string; fileSize: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/v1/images/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("이미지 업로드 실패");
  return res.json();
};
export const toggleLike = (token: string, postId: number) =>
  fetchApi<{ liked: boolean }>(`/posts/${postId}/likes`, { method: "POST", token });
export const createComment = (token: string, postId: number, content: string, parentId?: number) =>
  fetchApi<{ id: number }>(`/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: JSON.stringify({ content, parentId }),
  });

// ─── Fan Level ───

export interface FanLevel {
  level: number;
  levelName: string;
  totalPoints: number;
  nextLevelPoints: number;
  progress: number;
}

export const getFanLevel = (token: string) =>
  fetchApi<FanLevel>("/users/me/fan-level", { token });

// ─── Auth ───

export const loginApi = (data: {
  provider: string;
  providerId: string;
  email: string;
  nickname: string;
  profileImg?: string;
}) => fetchApi<{ token: string; userId: number; nickname: string }>("/auth/login", {
  method: "POST",
  body: JSON.stringify(data),
});
