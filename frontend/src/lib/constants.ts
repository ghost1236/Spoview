export const ZONE_COLORS: Record<string, { color: string; label: string }> = {
  "Champions League": { color: "#1E40AF", label: "챔피언스리그" },
  "Champions League Qualifiers": { color: "#3B82F6", label: "챔스 예선" },
  "Europa League": { color: "#EA580C", label: "유로파리그" },
  "Europa Conference League": { color: "#16A34A", label: "컨퍼런스리그" },
  "Europa Conference League Qualifiers": { color: "#4ADE80", label: "컨퍼런스 예선" },
  ACL: { color: "#0EA5E9", label: "ACL" },
  "AFC Champions League": { color: "#0EA5E9", label: "ACL" },
  Relegation: { color: "#DC2626", label: "강등" },
  "Relegation Playoff": { color: "#F87171", label: "강등 플레이오프" },
  Promotion: { color: "#7C3AED", label: "승격" },
};

export const LEAGUE_TABS = [
  { code: null, label: "전체" },
  { code: "epl", label: "EPL" },
  { code: "laliga", label: "라리가" },
  { code: "bundesliga", label: "분데스" },
  { code: "seriea", label: "세리에A" },
  { code: "ligue1", label: "리그앙" },
  { code: "kbo", label: "KBO" },
  { code: "mlb", label: "MLB" },
  { code: "kleague1", label: "K리그1" },
  { code: "kleague2", label: "K리그2" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  FREE: "자유",
  REVIEW: "경기리뷰",
  TRANSFER: "이적소식",
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatDate(dateStr);
}
