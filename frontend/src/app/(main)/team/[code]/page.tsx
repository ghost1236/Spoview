"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TeamLogo } from "@/components/common/TeamLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { getTeamColor } from "@/lib/teamColors";
import dynamic from "next/dynamic";
import {
  getTeamDetail,
  getTeamMatches,
  getLeagueStandings,
  type TeamDetail,
  type Match,
  type Standing,
} from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatDate, ZONE_COLORS } from "@/lib/constants";

const RecentFormChart = dynamic(() => import("@/components/charts/RecentFormChart").then(m => m.RecentFormChart), { ssr: false });
const RankTrendChart = dynamic(() => import("@/components/charts/RankTrendChart").then(m => m.RankTrendChart), { ssr: false });
const HomeAwayBarChart = dynamic(() => import("@/components/charts/HomeAwayBarChart").then(m => m.HomeAwayBarChart), { ssr: false });
const WinLossDonutChart = dynamic(() => import("@/components/charts/WinLossDonutChart").then(m => m.WinLossDonutChart), { ssr: false });

type Tab = "overview" | "fixtures" | "stats";

const LN: Record<string, string> = {
  epl: "EPL", laliga: "라리가", bundesliga: "분데스리가", seriea: "세리에A", ligue1: "리그앙",
  kleague1: "K리그1", kleague2: "K리그2", kbo: "KBO", mlb: "MLB",
};

export default function TeamDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [following, setFollowing] = useState(false);
  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const subs = subscriptionsByUser[currentUserId || "_guest"] || [];

  useEffect(() => {
    if (!code) return;
    setFollowing(subs.some((s: any) => s.teamCode === code));
    getTeamDetail(code).then(setTeam).catch(console.error);
    getTeamMatches(code, 365).then(setMatches).catch(console.error);
  }, [code, subs]);

  useEffect(() => {
    if (!team) return;
    getLeagueStandings(team.league.leagueCode).then(setStandings).catch(console.error);
  }, [team]);

  if (!team) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--brand-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>;
  }

  const isFootball = team.team.sportType === "FOOTBALL";
  const myStanding = standings.find(s => s.team.teamCode === code);
  const upcoming = matches.filter(m => m.status === "SCHEDULED").sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const recent = matches.filter(m => m.status === "FINISHED").sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  const teamColor = getTeamColor(code);

  // Compute home/away splits
  const home = { W: 0, D: 0, L: 0 }, away = { W: 0, D: 0, L: 0 };
  recent.forEach(m => {
    const isHome = m.homeTeam.teamCode === code;
    const gf = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const ga = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
    const bucket = isHome ? home : away;
    if (gf > ga) bucket.W++; else if (gf === ga) bucket.D++; else bucket.L++;
  });
  const splitsData = { [code]: { home, away, name: team.team.nameKo } };

  const STAT_CARDS = myStanding ? [
    { label: "리그 순위", value: myStanding.rank, suffix: "위", color: teamColor },
    { label: "경기수", value: myStanding.played, suffix: "경기", color: undefined },
    { label: isFootball ? "승점" : "승률", value: isFootball ? myStanding.points : myStanding.winningPct, suffix: isFootball ? "점" : "", color: undefined },
    { label: "득실차", value: myStanding.goalDiff >= 0 ? `+${myStanding.goalDiff}` : myStanding.goalDiff, suffix: "", color: myStanding.goalDiff >= 0 ? "#16A34A" : "#DC2626" },
  ] : [];

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "개요" },
    { key: "fixtures", label: "일정 · 결과" },
    { key: "stats", label: "통계" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          <Link href="/" style={{ color: "inherit" }}>홈</Link> · <span style={{ color: "var(--text)", fontWeight: 600 }}>{team.team.nameKo}</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, padding: 28, display: "flex", gap: 24, alignItems: "center",
        position: "relative", overflow: "hidden", marginBottom: 24,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: teamColor }} />
        <TeamLogo teamCode={code} name={team.team.nameKo} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 6 }}>
            {LN[team.league.leagueCode] || team.league.nameKo} · {isFootball ? "축구" : "야구"}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 10px", color: "var(--text)" }}>{team.team.nameKo}</h1>
          <div style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--text-secondary)" }}>
            {myStanding && (
              <>
                <span><strong style={{ color: "var(--text)", fontWeight: 700 }}>{myStanding.rank}</strong>위</span>
                <span>{isFootball ? `${myStanding.won}승 ${myStanding.drawn}무 ${myStanding.lost}패` : `${myStanding.won}승 ${myStanding.lost}패`}</span>
                <span>{isFootball ? `${myStanding.points}점` : `승률 ${myStanding.winningPct}`}</span>
              </>
            )}
          </div>
        </div>
        <button onClick={() => setFollowing(f => !f)} style={{
          padding: "12px 22px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
          background: following ? "var(--surface)" : "var(--text)",
          color: following ? "var(--text)" : "var(--surface)",
          border: following ? "1px solid var(--border-strong)" : "none",
          transition: "all 0.15s",
        }}>
          {following ? "✓ 팔로잉" : "+ 팔로우"}
        </button>
      </div>

      {/* Stats grid */}
      {STAT_CARDS.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 8 }}>{s.label}</div>
              <div><span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums", lineHeight: 1, color: s.color || "var(--text)" }}>{s.value}</span><span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: 3, fontWeight: 600 }}>{s.suffix}</span></div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "12px 18px", border: "none", background: "none", cursor: "pointer",
            fontSize: 14, fontWeight: tab === t.key ? 700 : 600,
            color: tab === t.key ? "var(--text)" : "var(--text-secondary)",
            borderBottom: `2px solid ${tab === t.key ? teamColor : "transparent"}`,
            marginBottom: -1, transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && (
        <>
          {/* 다가오는 경기 + 리그 순위 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 32 }}>
            <div>
              <SH title="다가오는 경기" />
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                {upcoming.length === 0 ? (
                  <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>예정된 경기 없음</div>
                ) : upcoming.slice(0, 4).map(m => (
                  <MatchRow key={m.id} match={m} teamCode={code} isFootball={isFootball} />
                ))}
              </div>
            </div>
            <div>
              <SH title="리그 순위" />
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                {standings.length > 0 ? standings.slice(0, 6).map(r => {
                  const isMine = r.team.teamCode === code;
                  const zone = r.zoneDescription ? ZONE_COLORS[r.zoneDescription] : null;
                  return (
                    <div key={r.team.teamCode} style={{
                      display: "grid", gridTemplateColumns: "4px 22px 22px 1fr auto auto",
                      gap: 8, alignItems: "center", padding: "8px 4px", fontSize: 13,
                      borderBottom: "1px solid var(--border)",
                      ...(isMine ? { background: "var(--surface-2)", borderRadius: 8, margin: "0 -6px", padding: "8px 10px", borderBottom: "1px solid transparent" } : {}),
                    }}>
                      <span style={{ width: 4, height: 22, borderRadius: 2, background: zone?.color || "transparent" }} />
                      <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: isMine ? "var(--text)" : "var(--text-secondary)" }}>{r.rank}</span>
                      <TeamLogo teamCode={r.team.teamCode} name={r.team.nameKo} size={22} />
                      <span style={{ fontWeight: isMine ? 800 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.team.nameKo}</span>
                      <span style={{ color: "var(--text-tertiary)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{isFootball ? `${r.won}-${r.drawn}-${r.lost}` : `${r.won}-${r.lost}`}</span>
                      <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 30 }}>{isFootball ? r.points : r.winningPct}</span>
                    </div>
                  );
                }) : <div style={{ color: "var(--text-tertiary)", padding: 12, fontSize: 13 }}>순위표 준비중</div>}
                {myStanding && myStanding.rank > 6 && (
                  <>
                    <div style={{ textAlign: "center", padding: "4px 0", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.15em" }}>···</div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "4px 22px 22px 1fr auto auto",
                      gap: 8, alignItems: "center", padding: "8px 10px", fontSize: 13,
                      background: "var(--surface-2)", borderRadius: 8, margin: "0 -6px",
                    }}>
                      <span style={{ width: 4, height: 22, borderRadius: 2, background: myStanding.zoneDescription ? ZONE_COLORS[myStanding.zoneDescription]?.color || "transparent" : "transparent" }} />
                      <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{myStanding.rank}</span>
                      <TeamLogo teamCode={code} name={team.team.nameKo} size={22} />
                      <span style={{ fontWeight: 800 }}>{team.team.nameKo}</span>
                      <span style={{ color: "var(--text-tertiary)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{isFootball ? `${myStanding.won}-${myStanding.drawn}-${myStanding.lost}` : `${myStanding.won}-${myStanding.lost}`}</span>
                      <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 30 }}>{isFootball ? myStanding.points : myStanding.winningPct}</span>
                    </div>
                  </>
                )}
                {/* Zone legend */}
                {isFootball && (() => {
                  const zones = Array.from(new Set(standings.slice(0, 6).map(r => r.zoneDescription).filter(Boolean)));
                  return zones.length > 0 ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--border)" }}>
                      {zones.filter((z): z is string => z !== null).map(z => {
                        const info = ZONE_COLORS[z];
                        return info ? (
                          <span key={z} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-tertiary)" }}>
                            <span style={{ width: 4, height: 10, borderRadius: 2, background: info.color }} />{info.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* 최근 경기 결과 */}
          <SH title="최근 경기" />
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            {recent.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>최근 경기 없음</div>
            ) : recent.slice(0, 5).map(m => (
              <MatchRow key={m.id} match={m} teamCode={code} isFootball={isFootball} showResult />
            ))}
          </div>
        </>
      )}

      {/* ═══ FIXTURES ═══ */}
      {tab === "fixtures" && (
        <>
          <SH title="시즌 일정" />
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            {[...upcoming, ...recent].length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>경기 데이터 없음</div>
            ) : [...upcoming, ...recent].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()).map(m => (
              <MatchRow key={m.id} match={m} teamCode={code} isFootball={isFootball} showResult />
            ))}
          </div>
        </>
      )}

      {/* ═══ STATS ═══ */}
      {tab === "stats" && (
        <>
          {/* 순위 추이 */}
          <SH title="순위 추이" />
          <RankTrendChart
            teamMatchesMap={{ [code]: matches }}
            standingsMap={{ [team.league.leagueCode]: standings }}
            teams={[{ teamCode: code, nameKo: team.team.nameKo, leagueCode: team.league.leagueCode, color: teamColor }]}
          />

          {/* 득실 차트 */}
          <div style={{ marginTop: 32 }}>
            <SH title="최근 득실" />
            {matches.filter(m => m.status === "FINISHED").length > 0 ? (
              <RecentFormChart matches={matches} teamCode={code} />
            ) : (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>차트 데이터 없음</div>
            )}
          </div>

          {/* 홈 · 원정 성적 */}
          <div style={{ marginTop: 32 }}>
            <SH title="홈 · 원정 성적" />
            {recent.length > 0 ? (
              <HomeAwayBarChart data={splitsData} />
            ) : (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, textAlign: "center", padding: 30, color: "var(--text-tertiary)", fontSize: 13 }}>매치 데이터 없음</div>
            )}
          </div>

          {/* 승무패 비율 */}
          {myStanding && (
            <div style={{ marginTop: 32 }}>
              <SH title="시즌 승무패 비율" />
              <WinLossDonutChart teams={[{
                name: team.team.nameKo,
                won: myStanding.won,
                drawn: myStanding.drawn,
                lost: myStanding.lost,
                isFootball,
              }]} />
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="1.6fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SH({ title }: { title: string }) {
  return <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)", marginBottom: 12 }}>{title}</h2>;
}

function MatchRow({ match: m, teamCode, isFootball, showResult }: {
  match: Match; teamCode: string; isFootball: boolean; showResult?: boolean;
}) {
  const isLive = m.status === "LIVE";
  const isFinished = m.status === "FINISHED";
  const isHome = m.homeTeam.teamCode === teamCode;
  const won = isFinished && ((isHome && (m.homeScore ?? 0) > (m.awayScore ?? 0)) || (!isHome && (m.awayScore ?? 0) > (m.homeScore ?? 0)));
  const tied = isFinished && m.homeScore === m.awayScore;
  const result = won ? "W" : tied ? "D" : "L";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "80px 1fr auto 1fr 70px",
      gap: 14, alignItems: "center", padding: "12px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>{formatDate(m.matchDate)}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <TeamLogo teamCode={m.homeTeam.teamCode} name={m.homeTeam.nameKo} size={24} />
        <span style={{
          fontWeight: m.homeTeam.teamCode === teamCode ? 700 : 600, fontSize: 13,
          color: m.homeTeam.teamCode !== teamCode ? "var(--text-secondary)" : "var(--text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{m.homeTeam.nameKo}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "center", color: isLive ? "#DC2626" : "var(--text)" }}>
        {isLive || isFinished ? `${m.homeScore} : ${m.awayScore}` : <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>VS</span>}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexDirection: "row-reverse", justifyContent: "flex-end" }}>
        <TeamLogo teamCode={m.awayTeam.teamCode} name={m.awayTeam.nameKo} size={24} />
        <span style={{
          fontWeight: m.awayTeam.teamCode === teamCode ? 700 : 600, fontSize: 13,
          color: m.awayTeam.teamCode !== teamCode ? "var(--text-secondary)" : "var(--text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{m.awayTeam.nameKo}</span>
      </div>
      <span style={{ textAlign: "right" }}>
        {showResult && isFinished ? (
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.05em",
            width: 20, height: 20, borderRadius: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff",
            background: result === "W" ? "#16A34A" : result === "D" ? "#94A3B8" : "#DC2626",
          }}>{result}</span>
        ) : isLive ? (
          <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 700 }}>LIVE</span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 700 }}>예정</span>
        )}
      </span>
    </div>
  );
}
