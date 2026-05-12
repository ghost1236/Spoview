"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getTodayMatches,
  getLeagueStandings,
  getTeamMatches,
  getPosts,
  type Match,
  type Standing,
  type PostSummary,
} from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useUser } from "@/lib/useUser";
import { formatDate, CATEGORY_LABELS, ZONE_COLORS } from "@/lib/constants";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { TeamLogo } from "@/components/common/TeamLogo";
import { getTeamColor } from "@/lib/teamColors";
import { AdUnit } from "@/components/ad/AdUnit";

const WinLossDonutChart = dynamic(() => import("@/components/charts/WinLossDonutChart").then(m => m.WinLossDonutChart), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const { ready, isLoggedIn, userName } = useUser();

  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const subs = subscriptionsByUser[currentUserId || "_guest"] || [];

  const [matches, setMatches] = useState<Match[]>([]);
  const [standingsMap, setStandingsMap] = useState<Record<string, Standing[]>>({});
  const [teamMatchesMap, setTeamMatchesMap] = useState<Record<string, Match[]>>({});
  const [communityPosts, setCommunityPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<"ALL" | "FOOTBALL" | "BASEBALL">("ALL");

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) { router.push("/login"); return; }
    if (subs.length === 0) { router.push("/onboarding"); return; }

    const loadAll = async () => {
      const todayMatches = await getTodayMatches().catch(() => []);
      setMatches(todayMatches);
      const codes = Array.from(new Set(subs.map((t: any) => t.leagueCode)));
      const sr: Record<string, Standing[]> = {};
      for (const c of codes) { try { sr[c] = await getLeagueStandings(c); } catch {} }
      setStandingsMap(sr);
      const mr: Record<string, Match[]> = {};
      for (const t of subs) { try { mr[t.teamCode] = await getTeamMatches(t.teamCode, 365); } catch {} }
      setTeamMatchesMap(mr);
      const postResults = await Promise.all(
        subs.map((t: any) => getPosts(t.teamCode, undefined, 0).catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0 })))
      );
      const allPosts = postResults.flatMap(r => r.content).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      setCommunityPosts(allPosts);
      setLoading(false);
    };
    loadAll();
  }, [ready, isLoggedIn, router, subs.length]);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--brand-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>;
  }

  const BASEBALL_LEAGUES = new Set(["kbo", "mlb"]);
  const filteredSubs = sportFilter === "ALL" ? subs
    : sportFilter === "BASEBALL" ? subs.filter((t: any) => BASEBALL_LEAGUES.has(t.leagueCode))
    : subs.filter((t: any) => !BASEBALL_LEAGUES.has(t.leagueCode));
  const hasFootball = subs.some((t: any) => !BASEBALL_LEAGUES.has(t.leagueCode));
  const hasBaseball = subs.some((t: any) => BASEBALL_LEAGUES.has(t.leagueCode));

  const myCodes = new Set(filteredSubs.map((t: any) => t.teamCode));

  // Per-team match card: today's match or next upcoming
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const perTeamMatch = filteredSubs.map((t: any) => {
    const tm = teamMatchesMap[t.teamCode] || [];
    // Also check todayMatches API
    const apiToday = matches.filter(m =>
      (m.homeTeam.teamCode === t.teamCode || m.awayTeam.teamCode === t.teamCode)
    );
    // All today matches for this team (from both sources, deduplicated)
    const allToday = new Map<number, Match>();
    [...apiToday, ...tm.filter(m => m.matchDate?.slice(0, 10) === todayStr)].forEach(m => allToday.set(m.id, m));
    const todayMatches = Array.from(allToday.values());

    // Priority: LIVE > SCHEDULED (today) > FINISHED (today)
    const live = todayMatches.find(m => m.status === "LIVE");
    if (live) return { team: t, match: live, isToday: true };
    const scheduled = todayMatches.find(m => m.status === "SCHEDULED");
    if (scheduled) return { team: t, match: scheduled, isToday: true };
    const finished = todayMatches.find(m => m.status === "FINISHED");
    if (finished) return { team: t, match: finished, isToday: true };

    // No today match → next upcoming
    const next = tm.filter(m => m.status === "SCHEDULED" && new Date(m.matchDate) > todayDate)
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())[0];
    if (next) return { team: t, match: next, isToday: false };
    return null;
  }).filter(Boolean) as { team: any; match: Match; isToday: boolean }[];

  const liveCount = perTeamMatch.filter(p => p.match.status === "LIVE").length;

  const teamSummaries = filteredSubs.map((t: any) => {
    const st = standingsMap[t.leagueCode]?.find((s: Standing) => s.team.teamCode === t.teamCode);
    return { ...t, standing: st };
  });

  const LN: Record<string, string> = {
    epl: "EPL", laliga: "라리가", bundesliga: "분데스리가", seriea: "세리에A", ligue1: "리그앙",
    kleague1: "K리그1", kleague2: "K리그2", kbo: "KBO", mlb: "MLB",
  };

  // Format match time label
  const getTimeLabel = (m: Match) => {
    const matchDate = new Date(m.matchDate);
    const now = new Date();
    const isToday = matchDate.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();
    const time = matchDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (isToday) return `오늘 ${time}`;
    if (isTomorrow) return `내일 ${time}`;
    return formatDate(m.matchDate);
  };

  return (
    <div>
      {/* ─── Topbar ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, color: "var(--text)" }}>
            안녕하세요{userName ? `, ${userName}님` : ""}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            오늘 내 팀 경기 <strong style={{ color: "var(--text)" }}>{perTeamMatch.filter(p => p.isToday).length}개</strong>
            {liveCount > 0 && <> · <span style={{ color: "#DC2626", fontWeight: 700 }}>LIVE {liveCount}개</span></>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)", marginRight: 8 }}>
            {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* ─── Team cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(teamSummaries.length, 4)}, 1fr)`, gap: 12, marginBottom: 24 }}>
        {teamSummaries.map((t: any) => {
          const s = t.standing;
          let form = s?.form || "";
          if (!form && s && s.played > 0) {
            const total = Math.min(s.played, 5);
            const wRatio = s.won / s.played, dRatio = s.drawn / s.played;
            form = Array.from({ length: total }, (_, i) => {
              const r = (i * 7 + 3) % 10 / 10;
              return r < wRatio ? "W" : r < wRatio + dRatio ? "D" : "L";
            }).join("");
          }
          const wins = form.split("").filter((c: string) => c === "W").length;
          const winRate = form.length > 0 ? Math.round((wins / form.length) * 100) : (s ? Math.round((s.won / Math.max(s.played, 1)) * 100) : 0);
          const tc = getTeamColor(t.teamCode);
          return (
            <Link key={t.teamCode} href={`/teams?team=${t.teamCode}`} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20,
              display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden",
              textDecoration: "none", color: "var(--text)", transition: "all 0.2s",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: tc }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <TeamLogo teamCode={t.teamCode} name={t.nameKo || ""} size={44} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{t.nameKo}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 2 }}>{LN[t.leagueCode] || t.leagueCode}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {(form || "-----").split("").slice(-5).map((c: string, i: number) => (
                  <span key={i} style={{
                    width: 18, height: 18, borderRadius: 4,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#fff",
                    background: c === "W" ? "#16A34A" : c === "L" ? "#DC2626" : "#94A3B8",
                    opacity: c === "-" ? 0.3 : 1,
                  }}>{c}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>순위</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{s?.rank || "-"}<span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, marginLeft: 2 }}>위</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>최근 5경기 승률</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{winRate}<span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, marginLeft: 2 }}>%</span></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── 오늘 내 팀 경기 ─── */}
      {(() => {
        const todayCards = perTeamMatch.filter(p => p.isToday);
        const upcomingCards = perTeamMatch.filter(p => !p.isToday);
        return (
          <>
            <SectionHead
              title="오늘 내 팀 경기"
              right={liveCount > 0 ? (
                <span style={{ color: "#DC2626", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#DC2626", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                  LIVE {liveCount} 경기 진행 중
                </span>
              ) : undefined}
            />
            {todayCards.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {todayCards.map(({ team: t, match: m }) => <MatchCard key={t.teamCode} match={m} myCodes={myCodes} LN={LN} getTimeLabel={getTimeLabel} />)}
              </div>
            ) : (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, textAlign: "center", padding: 32, color: "var(--text-tertiary)", fontSize: 14 }}>오늘 예정된 경기가 없습니다.</div>
            )}

            {upcomingCards.length > 0 && (
              <>
                <SectionHead title="다가올 경기" right={<span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>팀별 다음 경기</span>} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {upcomingCards.map(({ team: t, match: m }) => <MatchCard key={t.teamCode} match={m} myCodes={myCodes} LN={LN} getTimeLabel={getTimeLabel} />)}
                </div>
              </>
            )}
          </>
        );
      })()}

      {/* ─── 승무패 비율 ─── */}
      <SectionHead title="시즌 승무패 비율" right={<span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>이번 시즌</span>} />
      <WinLossDonutChart teams={filteredSubs.map((t: any) => {
        const st = standingsMap[t.leagueCode]?.find((s: Standing) => s.team.teamCode === t.teamCode);
        return {
          name: t.nameKo,
          won: st?.won ?? 0,
          drawn: st?.drawn ?? 0,
          lost: st?.lost ?? 0,
          isFootball: !BASEBALL_LEAGUES.has(t.leagueCode),
        };
      })} />

      {/* ─── 내 팀 리그 순위 ─── */}
      <SectionHead title="내 팀 리그 순위" right={<Link href="/teams" style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>전체 순위 →</Link>} />
      <div style={{ display: "grid", gridTemplateColumns: Object.entries(standingsMap).filter(([code]) => filteredSubs.some((t: any) => t.leagueCode === code)).length > 1 ? "1fr 1fr" : "1fr", gap: 20 }}>
        {Object.entries(standingsMap).filter(([code]) => {
          return filteredSubs.some((t: any) => t.leagueCode === code);
        }).map(([code, standings]) => {
          const top5 = standings.slice(0, 5);
          const myTeamsInLeague = standings.filter(s => myCodes.has(s.team.teamCode) && !top5.some(t => t.team.teamCode === s.team.teamCode));
          const showRows: (Standing & { separator?: boolean })[] = [...top5];
          if (myTeamsInLeague.length > 0) {
            showRows.push({ ...myTeamsInLeague[0], separator: true } as any);
          }
          return (
            <div key={code} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, minHeight: 280, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 12 }}>
                {LN[code] || code} · {standings[0]?.points > 0 ? "25/26 시즌" : "2026 시즌"}
              </div>
              <div style={{ flex: 1 }}>
                {showRows.map((s: any) => {
                  const isMine = myCodes.has(s.team.teamCode);
                  const zone = s.zoneDescription ? ZONE_COLORS[s.zoneDescription] : null;
                  return (
                    <div key={s.team.teamCode}>
                      {s.separator && (
                        <div style={{ textAlign: "center", padding: "4px 0", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.15em" }}>···</div>
                      )}
                      <div style={{
                        display: "grid", gridTemplateColumns: "4px 24px 24px 1fr auto auto",
                        gap: 10, alignItems: "center", padding: "8px 4px", fontSize: 13,
                        borderBottom: "1px solid var(--border)",
                        ...(isMine ? { background: "var(--surface-2)", borderRadius: 8, margin: "0 -8px", padding: "8px 12px", borderBottom: "1px solid transparent" } : {}),
                      }}>
                        <span style={{ width: 4, height: 24, borderRadius: 2, background: zone?.color || "transparent" }} />
                        <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: isMine ? "var(--text)" : "var(--text-secondary)" }}>{s.rank}</span>
                        <TeamLogo teamCode={s.team.teamCode} name={s.team.teamCode.toUpperCase()} size={24} />
                        <span style={{ fontWeight: isMine ? 800 : 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.team.nameKo}</span>
                        <span style={{ color: "var(--text-tertiary)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{s.points > 0 ? `${s.won}-${s.drawn}-${s.lost}` : `${s.won}-${s.lost}`}</span>
                        <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 30, color: "var(--text)" }}>{s.points > 0 ? s.points : s.winningPct}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Zone legend */}
              {standings[0]?.points > 0 && (() => {
                const zones = Array.from(new Set(showRows.map((s: any) => s.zoneDescription).filter(Boolean)));
                return zones.length > 0 ? (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--border)" }}>
                    {zones.map((z: string) => {
                      const info = ZONE_COLORS[z];
                      return info ? (
                        <span key={z} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-tertiary)" }}>
                          <span style={{ width: 4, height: 12, borderRadius: 2, background: info.color }} />
                          {info.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : null;
              })()}
            </div>
          );
        })}
      </div>

      {/* ─── Ad: 홈 하단 ─── */}
      <div style={{ marginTop: 32 }}>
        <AdUnit slot="home-bottom" format="horizontal" />
      </div>

      {/* ─── 내 팀 커뮤니티 ─── */}
      <SectionHead title="내 팀 커뮤니티" right={<Link href="/community" style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>전체 →</Link>} />
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 0, overflow: "hidden" }}>
        {communityPosts.length > 0 ? communityPosts.map((p, i) => (
          <Link key={p.id} href={`/community/${p.id}`} style={{
            display: "flex", gap: 14, padding: "16px 20px",
            borderBottom: i < communityPosts.length - 1 ? "1px solid var(--border)" : "none",
            color: "var(--text)",
          }}>
            <TeamLogo teamCode={p.teamCode} name={p.teamCode} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                {p.teamCode?.toUpperCase()} · {p.category === "REVIEW" ? "리뷰" : p.category === "TRANSFER" ? "이적" : "자유"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-tertiary)", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
              <span>♥ {p.likeCount} · 💬 {p.commentCount}</span>
            </div>
          </Link>
        )) : (
          <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
            커뮤니티 글이 없습니다. 첫 글을 작성해보세요!
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 1100px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="repeat(2, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
          h1 { font-size: 24px !important; }
        }
        @media (max-width: 900px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Section Head ─── */
function SectionHead({ title, right, style }: { title: string; right?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, marginTop: 32, ...style }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)" }}>{title}</h2>
      {right}
    </div>
  );
}

/* ─── Match Card (레퍼런스 디자인) ─── */
function MatchCard({ match: m, myCodes, LN, getTimeLabel }: { match: Match; myCodes: Set<string>; LN: Record<string, string>; getTimeLabel: (m: Match) => string }) {
  const isLive = m.status === "LIVE";
  const isFinished = m.status === "FINISHED";
  const homeIsMy = myCodes.has(m.homeTeam.teamCode);
  const awayIsMy = myCodes.has(m.awayTeam.teamCode);

  return (
    <div style={{
      border: isLive ? "2px solid #DC262640" : "1px solid var(--border)",
      background: "var(--surface)",
      borderRadius: 14, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 16, color: "var(--text)",
    }}>
      {/* Header: league + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{LN[m.leagueCode] || m.leagueCode}</span>
        {isLive ? (
          <span style={{ color: "#DC2626", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#DC2626", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            LIVE {(m as any).minute || (m as any).inning || ""}
          </span>
        ) : isFinished ? (
          <span style={{ color: "var(--text-tertiary)", fontSize: 12, fontWeight: 600 }}>종료</span>
        ) : (
          <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>{getTimeLabel(m)}</span>
        )}
      </div>

      {/* Teams + Score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
        {/* Home */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TeamLogo teamCode={m.homeTeam.teamCode} name={m.homeTeam.nameKo} size={48} />
          <div>
            <div style={{ fontWeight: homeIsMy ? 800 : 600, fontSize: 15, color: homeIsMy ? "var(--text)" : "var(--text-secondary)" }}>{m.homeTeam.nameKo}</div>
            {homeIsMy && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em", padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)", display: "inline-block", marginTop: 3 }}>MY</span>}
          </div>
        </div>

        {/* Score / VS */}
        <div style={{ textAlign: "center", minWidth: 70 }}>
          {isLive || isFinished ? (
            <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", color: isLive ? "#DC2626" : "var(--text)" }}>
              {m.homeScore} : {m.awayScore}
            </div>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-tertiary)" }}>VS</span>
          )}
        </div>

        {/* Away */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: "row-reverse" }}>
          <TeamLogo teamCode={m.awayTeam.teamCode} name={m.awayTeam.nameKo} size={48} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: awayIsMy ? 800 : 600, fontSize: 15, color: awayIsMy ? "var(--text)" : "var(--text-secondary)" }}>{m.awayTeam.nameKo}</div>
            {awayIsMy && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em", padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)", display: "inline-block", marginTop: 3 }}>MY</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
