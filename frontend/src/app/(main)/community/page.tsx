"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPosts, type PostSummary, type PageResponse } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { CATEGORY_LABELS, relativeTime } from "@/lib/constants";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { TeamLogo } from "@/components/common/TeamLogo";
import { getTeamColor } from "@/lib/teamColors";
import { AdUnit } from "@/components/ad/AdUnit";

export default function CommunityPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--brand-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>}>
      <CommunityContent />
    </Suspense>
  );
}

const CATEGORIES = [
  { id: null, label: "전체" },
  { id: "REVIEW", label: "경기 리뷰" },
  { id: "TRANSFER", label: "이적/소식" },
  { id: "FREE", label: "자유" },
];

function CommunityContent() {
  const searchParams = useSearchParams();
  const teamCode = searchParams.get("team");
  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const localSubscriptions = subscriptionsByUser[currentUserId || "_guest"] || [];
  const [teamFilter, setTeamFilter] = useState<string>(teamCode || "all");
  const [category, setCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<PageResponse<PostSummary> | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (teamFilter !== "all" && teamFilter !== "mine") {
          // 특정 팀 선택
          const result = await getPosts(teamFilter, category ?? undefined, page);
          setPosts(result);
        } else {
          // "전체" 또는 "내 팀": 구독 팀 전부에서 게시글 합침
          const teams = teamFilter === "mine" ? localSubscriptions : localSubscriptions;
          if (teams.length === 0) {
            setPosts({ content: [], totalElements: 0, totalPages: 0, number: 0 });
            return;
          }
          const results = await Promise.all(
            teams.slice(0, 4).map((t: any) => getPosts(t.teamCode, category ?? undefined, 0).catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0 })))
          );
          const allPosts = results.flatMap(r => r.content).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPosts({ content: allPosts.slice(0, 20), totalElements: allPosts.length, totalPages: 1, number: 0 });
        }
      } catch {
        setPosts({ content: [], totalElements: 0, totalPages: 0, number: 0 });
      }
    };
    fetchPosts();
  }, [teamFilter, category, page, localSubscriptions.length]);

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>커뮤니티</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "4px 0 0" }}>내 팀 팬들과 함께 경기를 즐겨보세요</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Team filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => { setTeamFilter("all"); setPage(0); }}
          style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: teamFilter === "all" ? "var(--brand-primary)" : "var(--surface)",
            color: teamFilter === "all" ? "#fff" : "var(--text-secondary)",
            border: teamFilter === "all" ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
            boxShadow: teamFilter === "all" ? "0 4px 12px rgba(30,64,175,0.2)" : "none",
            transition: "all 0.15s",
          }}>전체</button>
        <button onClick={() => { setTeamFilter("mine"); setPage(0); }}
          style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: teamFilter === "mine" ? "var(--brand-primary)" : "var(--surface)",
            color: teamFilter === "mine" ? "#fff" : "var(--text-secondary)",
            border: teamFilter === "mine" ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
            boxShadow: teamFilter === "mine" ? "0 4px 12px rgba(30,64,175,0.2)" : "none",
            transition: "all 0.15s",
          }}>내 팀</button>
        {localSubscriptions.map((t: any) => (
          <button key={t.teamCode} onClick={() => { setTeamFilter(t.teamCode); setPage(0); }}
            style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              background: teamFilter === t.teamCode ? "var(--brand-primary)" : "var(--surface)",
              color: teamFilter === t.teamCode ? "#fff" : "var(--text-secondary)",
              border: teamFilter === t.teamCode ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
              boxShadow: teamFilter === t.teamCode ? "0 4px 12px rgba(30,64,175,0.2)" : "none",
              transition: "all 0.15s",
            }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: teamFilter === t.teamCode ? "rgba(255,255,255,0.7)" : getTeamColor(t.teamCode),
            }} />
            {t.nameKo}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div>
          {/* Composer */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 16, marginBottom: 16,
            display: "flex", gap: 12, alignItems: "center",
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: "50%", background: "var(--brand-primary)", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 11, flexShrink: 0,
            }}>지</span>
            <Link href="/community/write" style={{
              flex: 1, background: "var(--surface-2)", border: "1px solid transparent",
              borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--text-tertiary)",
              display: "block",
            }}>무슨 생각을 나누고 싶으신가요?</Link>
            <Link href="/community/write" style={{
              width: 36, height: 36, borderRadius: "999px", border: "1px solid var(--border)",
              background: "var(--surface)", display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-secondary)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </Link>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <button key={c.id ?? "all"} onClick={() => { setCategory(c.id); setPage(0); }}
                style={{
                  padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: category === c.id ? 700 : 600,
                  color: category === c.id ? "var(--text)" : "var(--text-secondary)",
                  borderBottom: `2px solid ${category === c.id ? "var(--brand-primary)" : "transparent"}`,
                  marginBottom: -1, transition: "all 0.15s",
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts?.content.length === 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 40, textAlign: "center",
              color: "var(--text-tertiary)", fontSize: 13,
            }}>해당 조건의 게시글이 없습니다.</div>
          )}
          {posts?.content.map((p, idx) => {
            const catLabel = CATEGORY_LABELS[p.category] || p.category;
            const catClass = p.category === "REVIEW" ? "review" : p.category === "TRANSFER" ? "transfer" : "free";
            return (
              <div key={p.id}>
                {idx > 0 && idx % 5 === 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <AdUnit slot="community-feed" format="fluid" />
                  </div>
                )}
                <Link href={`/community/${p.id}`} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: 20, marginBottom: 12,
                  display: "block", transition: "all 0.15s", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 8px", borderRadius: 6, background: "var(--surface-2)",
                      fontSize: 11, fontWeight: 700, color: "var(--text-secondary)",
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: getTeamColor(p.teamCode ?? "") }} />
                      {p.teamCode?.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                      background: catClass === "review" ? "rgba(31,63,204,0.14)" : catClass === "transfer" ? "rgba(255,138,0,0.18)" : "var(--surface-2)",
                      color: catClass === "review" ? "var(--brand-primary)" : catClass === "transfer" ? "#C46C0C" : "var(--text-secondary)",
                    }}>{catLabel}</span>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: "auto" }}>{relativeTime(p.createdAt)}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.015em", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</h3>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, marginTop: 12 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{p.authorNickname}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {p.likeCount}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {p.commentCount}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Pagination */}
          {posts && posts.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {Array.from({ length: Math.min(posts.totalPages, 10) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{
                  width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: page === i ? "var(--brand-primary)" : "var(--surface-2)",
                  color: page === i ? "#fff" : "var(--text-secondary)",
                  border: "none",
                }}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>

        {/* Right column widgets */}
        <div>
          {/* 인기 글 (실제 데이터) */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 12 }}>인기 글</div>
            {(() => {
              const popular = [...(posts?.content || [])].sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount)).slice(0, 5);
              return popular.length > 0 ? popular.map((p, i) => (
                <Link key={p.id} href={`/community/${p.id}`} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: i < popular.length - 1 ? "1px solid var(--border)" : "none", fontSize: 13,
                  color: "var(--text)",
                }}>
                  <span style={{ fontWeight: 800, color: i < 2 ? "#DC2626" : "var(--text-tertiary)", width: 16, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, flexShrink: 0 }}>♥{p.likeCount} 💬{p.commentCount}</span>
                </Link>
              )) : (
                <div style={{ color: "var(--text-tertiary)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>게시글이 없습니다</div>
              );
            })()}
          </div>

          {/* 팀별 게시글 수 (실제 데이터) */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 12 }}>팀별 게시글</div>
            {(() => {
              const teamCounts: Record<string, { count: number; nameKo: string }> = {};
              (posts?.content || []).forEach(p => {
                const code = p.teamCode || "unknown";
                if (!teamCounts[code]) {
                  const sub = localSubscriptions.find((s: any) => s.teamCode === code);
                  teamCounts[code] = { count: 0, nameKo: sub?.nameKo || code.toUpperCase() };
                }
                teamCounts[code].count++;
              });
              const sorted = Object.entries(teamCounts).sort((a, b) => b[1].count - a[1].count);
              return sorted.length > 0 ? sorted.map(([code, info], i) => (
                <div key={code} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <TeamLogo teamCode={code} name={info.nameKo} size={24} />
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{info.nameKo}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{info.count}개</span>
                </div>
              )) : (
                <div style={{ color: "var(--text-tertiary)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>데이터 없음</div>
              );
            })()}
          </div>

          {/* 작성자 활동 (실제 데이터) */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 12 }}>활동 작성자</div>
            {(() => {
              const authors: Record<string, number> = {};
              (posts?.content || []).forEach(p => {
                const name = p.authorNickname || "익명";
                authors[name] = (authors[name] || 0) + 1;
              });
              const sorted = Object.entries(authors).sort((a, b) => b[1] - a[1]).slice(0, 5);
              return sorted.length > 0 ? sorted.map(([name, count], i) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", background: "var(--brand-primary)", color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 11, flexShrink: 0,
                  }}>{name.charAt(0)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{count}글</span>
                </div>
              )) : (
                <div style={{ color: "var(--text-tertiary)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>데이터 없음</div>
              );
            })()}
          </div>

          <div style={{
            background: "var(--surface-2)", border: "1px dashed var(--border)",
            borderRadius: 14, padding: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>커뮤니티 가이드</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              상대 팀 비방 없는 건강한 응원 문화를 함께 만들어요.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
