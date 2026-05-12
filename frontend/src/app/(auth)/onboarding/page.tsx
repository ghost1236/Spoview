"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getLeagues, getTeams, type League, type Team } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useUser } from "@/lib/useUser";
import { getTeamColor } from "@/lib/teamColors";
import { TeamLogo } from "@/components/common/TeamLogo";

const STEPS = ["welcome", "leagues", "teams", "notifs", "done"] as const;

const NOTIF_OPTIONS = [
  { id: "kickoff", title: "경기 시작", sub: "내 팀 경기가 시작되면 알림을 받아요", def: true },
  { id: "goal", title: "득점/주요 이벤트", sub: "골/홈런 등 주요 순간을 실시간으로", def: true },
  { id: "result", title: "경기 결과", sub: "경기가 끝나면 결과 요약을 보내드려요", def: true },
  { id: "transfer", title: "이적/소식", sub: "관심 팀의 이적과 부상 소식", def: false },
  { id: "community", title: "커뮤니티 활동", sub: "내 글에 좋아요/댓글이 달리면", def: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, isLoggedIn } = useUser();
  const { addSubscription, setCurrentUserId } = useAppStore();

  const [stepIdx, setStepIdx] = useState(0);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [activeLeagueTab, setActiveLeagueTab] = useState("all");
  const [search, setSearch] = useState("");
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    NOTIF_OPTIONS.reduce((a, o) => ({ ...a, [o.id]: o.def }), {} as Record<string, boolean>)
  );

  useEffect(() => {
    if (ready && !isLoggedIn) router.push("/login");
  }, [ready, isLoggedIn, router]);

  useEffect(() => {
    getLeagues().then(setLeagues);
    getTeams().then(setAllTeams);
  }, []);

  const step = STEPS[stepIdx];
  const pct = ((stepIdx + 1) / STEPS.length) * 100;

  const canNext = step === "leagues" ? selectedLeagues.length > 0
    : step === "teams" ? selectedTeams.length > 0
    : true;

  const next = () => setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx(i => Math.max(i - 1, 0));

  const filteredTeams = useMemo(() => {
    let t = allTeams.filter(team =>
      selectedLeagues.length === 0 || selectedLeagues.includes(team.leagueCode)
    );
    if (activeLeagueTab !== "all") t = t.filter(x => x.leagueCode === activeLeagueTab);
    if (search) {
      const q = search.toLowerCase();
      t = t.filter(x => x.nameKo.toLowerCase().includes(q) || x.nameEn.toLowerCase().includes(q));
    }
    return t;
  }, [allTeams, selectedLeagues, activeLeagueTab, search]);

  // 리그 해제 시 해당 팀 자동 제거
  useEffect(() => {
    setSelectedTeams(t => t.filter(team => selectedLeagues.includes(team.leagueCode)));
  }, [selectedLeagues]);

  const handleComplete = async () => {
    selectedTeams.forEach(t => addSubscription(t));
    // Save notification settings
    const { setNotifSettings, setNotifPermission } = useAppStore.getState();
    setNotifSettings({
      kickoff: !!notifs.kickoff,
      goal: !!notifs.goal,
      result: !!notifs.result,
      transfer: !!notifs.transfer,
      community: !!notifs.community,
    });
    // Request browser permission if any notification is enabled
    if (Object.values(notifs).some(Boolean) && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm as any);
    }
    window.location.href = "/";
  };

  const toggleLeague = (code: string) => {
    setSelectedLeagues(s => s.includes(code) ? s.filter(c => c !== code) : [...s, code]);
  };
  const toggleTeam = (team: Team) => {
    setSelectedTeams(s =>
      s.some(t => t.teamCode === team.teamCode) ? s.filter(t => t.teamCode !== team.teamCode) : [...s, team]
    );
  };

  const leagueMap: Record<string, { name: string; color: string }> = {
    epl: { name: "EPL", color: "#3D195B" },
    laliga: { name: "라리가", color: "#EE3325" },
    bundesliga: { name: "분데스리가", color: "#D20515" },
    seriea: { name: "세리에A", color: "#009A44" },
    ligue1: { name: "리그앙", color: "#1F3FCC" },
    kleague1: { name: "K리그1", color: "#1F8A4D" },
    kleague2: { name: "K리그2", color: "#1F8A4D" },
    kbo: { name: "KBO", color: "#D72631" },
    mlb: { name: "MLB", color: "#002D72" },
  };

  return (
    <div className="ob-app">
      {/* Top bar */}
      <div className="ob-top">
        <div className="ob-brand">
          <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="var(--brand-primary)"/><path d="M 8 12 A 8 8 0 0 1 22 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M 10 22 A 8 8 0 0 0 24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)"/></svg>
          <span>스포뷰</span>
        </div>
        <div className="ob-progress"><div className="ob-progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="ob-step-text tabular">{stepIdx + 1} / {STEPS.length}</div>
        {stepIdx > 0 && stepIdx < STEPS.length - 1 && (
          <button className="ob-skip" onClick={() => setStepIdx(STEPS.length - 1)}>건너뛰기</button>
        )}
      </div>

      {/* Main */}
      <div className="ob-main" key={step}>
        <div className="ob-card">

          {step === "welcome" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div className="ob-hero-art">
                <div className="ring" /><div className="ring r2" />
                <div className="center">
                  <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><path d="M 6 12 A 10 10 0 0 1 26 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M 8 22 A 10 10 0 0 0 28 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="3" fill="var(--brand-accent)"/></svg>
                </div>
              </div>
              <div className="h-eyebrow" style={{ color: "var(--brand-primary)", marginBottom: 12 }}>Welcome to 스포뷰</div>
              <h1 className="ob-title" style={{ fontSize: 40 }}>내 팀의 모든 순간,<br/>한 곳에서.</h1>
              <p className="ob-sub">좋아하는 팀과 리그를 선택하면 경기 일정부터 순위, 팬 커뮤니티까지<br/>맞춤으로 모아 드릴게요. 1분이면 끝나요.</p>
              <div className="ob-features">
                <div className="ob-feat"><div className="ob-feat-title">맞춤 경기 일정</div><div className="ob-feat-sub">놓치지 않게 미리 알려드려요</div></div>
                <div className="ob-feat"><div className="ob-feat-title">팀 데이터 인사이트</div><div className="ob-feat-sub">폼·랭킹·스탯까지</div></div>
                <div className="ob-feat"><div className="ob-feat-title">팬 커뮤니티</div><div className="ob-feat-sub">같은 팀 팬들과 함께</div></div>
              </div>
            </div>
          )}

          {step === "leagues" && (
            <>
              <div className="h-eyebrow" style={{ color: "var(--brand-primary)", marginBottom: 12 }}>Step 1</div>
              <h1 className="ob-title">관심 있는 리그를 골라주세요</h1>
              <p className="ob-sub">여러 개 선택할 수 있어요. 나중에 언제든 변경할 수 있습니다.</p>
              <div className="league-grid">
                {leagues.map(l => {
                  const info = leagueMap[l.leagueCode];
                  return (
                    <button key={l.leagueCode}
                      className={`league-card ${selectedLeagues.includes(l.leagueCode) ? "selected" : ""}`}
                      onClick={() => toggleLeague(l.leagueCode)}>
                      <div className="league-flag" style={{ background: info?.color || "var(--brand-primary)" }}>
                        {(info?.name || l.leagueCode).slice(0, 3)}
                      </div>
                      <div className="league-name">{info?.name || l.nameKo}</div>
                      <div className="league-sport">{l.sportType === "FOOTBALL" ? "축구" : "야구"} · {l.nameEn}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "teams" && (
            <>
              <div className="h-eyebrow" style={{ color: "var(--brand-primary)", marginBottom: 12 }}>Step 2</div>
              <h1 className="ob-title">팔로우할 팀을 골라주세요</h1>
              <p className="ob-sub">
                최소 1팀 이상 선택해주세요.
                {selectedTeams.length > 0 && <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}> · {selectedTeams.length}팀 선택됨</span>}
              </p>

              {selectedTeams.length > 0 && (
                <div className="selected-bar">
                  <span className="selected-label">선택됨</span>
                  {selectedTeams.map(t => (
                    <span key={t.teamCode} className="selected-chip">
                      {t.nameKo}
                      <button className="chip-x" onClick={() => toggleTeam(t)}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <input className="team-search" placeholder="팀 이름 검색..." value={search} onChange={e => setSearch(e.target.value)} />

              {selectedLeagues.length > 1 && (
                <div className="league-tabs">
                  <button className={`league-tab ${activeLeagueTab === "all" ? "active" : ""}`} onClick={() => setActiveLeagueTab("all")}>전체</button>
                  {selectedLeagues.map(code => (
                    <button key={code} className={`league-tab ${activeLeagueTab === code ? "active" : ""}`} onClick={() => setActiveLeagueTab(code)}>
                      {leagueMap[code]?.name || code}
                    </button>
                  ))}
                </div>
              )}

              <div className="team-grid">
                {filteredTeams.map(t => (
                  <button key={t.teamCode}
                    className={`team-card-ob ${selectedTeams.some(s => s.teamCode === t.teamCode) ? "selected" : ""}`}
                    onClick={() => toggleTeam(t)}>
                    <div className="team-logo-ob"><TeamLogo teamCode={t.teamCode} name={t.nameKo} size={48} /></div>
                    <div className="team-name-ob">{t.nameKo}</div>
                    <div className="team-league-ob">{leagueMap[t.leagueCode]?.name || t.leagueCode}</div>
                  </button>
                ))}
                {filteredTeams.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-tertiary)", fontSize: 14 }}>
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </>
          )}

          {step === "notifs" && (
            <>
              <div className="h-eyebrow" style={{ color: "var(--brand-primary)", marginBottom: 12 }}>Step 3</div>
              <h1 className="ob-title">어떤 순간에 알려드릴까요?</h1>
              <p className="ob-sub">필요한 알림만 켜두세요. 설정에서 언제든 변경할 수 있어요.</p>
              <div className="notif-list">
                {NOTIF_OPTIONS.map(opt => (
                  <div key={opt.id} className="notif-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{opt.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{opt.sub}</div>
                    </div>
                    <button
                      className={`switch ${notifs[opt.id] ? "on" : ""}`}
                      onClick={() => setNotifs(n => ({ ...n, [opt.id]: !n[opt.id] }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div className="ob-done-art">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="h-eyebrow" style={{ color: "var(--brand-primary)", marginBottom: 12 }}>All Set!</div>
              <h1 className="ob-title">준비가 끝났어요 🎉</h1>
              <p className="ob-sub">맞춤 피드를 만들어두었습니다. 지금 바로 시작해보세요.</p>
              <div className="ob-summary">
                <div className="ob-summary-row"><span className="ob-summary-label">관심 리그</span><span className="ob-summary-value">{selectedLeagues.length}개 리그</span></div>
                <div className="ob-summary-row"><span className="ob-summary-label">팔로우 팀</span><span className="ob-summary-value">{selectedTeams.slice(0, 3).map(t => t.nameKo).join(", ")}{selectedTeams.length > 3 ? ` 외 ${selectedTeams.length - 3}팀` : ""}</span></div>
                <div className="ob-summary-row"><span className="ob-summary-label">알림</span><span className="ob-summary-value">{Object.values(notifs).filter(Boolean).length}개 활성화</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="ob-foot">
        {stepIdx > 0 && stepIdx < STEPS.length - 1 ? (
          <button className="btn-ghost" onClick={back}>← 이전</button>
        ) : <div />}
        {step === "welcome" && <button className="btn-primary" onClick={next}>시작하기 →</button>}
        {(step === "leagues" || step === "teams" || step === "notifs") && (
          <button className="btn-primary" onClick={next} disabled={!canNext}>
            {step === "notifs" ? "완료" : "다음"} →
          </button>
        )}
        {step === "done" && <button className="btn-primary" onClick={handleComplete}>홈으로 이동 →</button>}
      </div>

      <style jsx>{`
        .ob-app { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); }
        .ob-top {
          padding: 20px 32px; display: flex; align-items: center; gap: 24px;
          border-bottom: 1px solid var(--border); background: var(--surface); color: var(--text);
          position: sticky; top: 0; z-index: 10;
        }
        .ob-brand { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
        .ob-progress { flex: 1; max-width: 480px; height: 4px; background: var(--surface-2); border-radius: 999px; overflow: hidden; }
        .ob-progress-fill { height: 100%; background: var(--brand-primary); transition: width 0.4s cubic-bezier(0.4,0,0.2,1); border-radius: 999px; }
        .ob-step-text { font-size: 12px; font-weight: 700; color: var(--text-tertiary); font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }
        .ob-skip { font-size: 13px; font-weight: 600; color: var(--text-tertiary); background: none; border: none; padding: 6px 10px; cursor: pointer; }
        .ob-skip:hover { color: var(--text); }
        .ob-main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 48px 32px 0; overflow-y: auto; background: var(--bg); }
        .ob-card { width: 100%; max-width: 720px; animation: stepIn 0.45s cubic-bezier(0.16,1,0.3,1); color: var(--text); }
        @keyframes stepIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .ob-title { font-size: 32px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2; margin: 0 0 12px; }
        .ob-sub { font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 32px; }
        .ob-foot {
          position: sticky; bottom: 0; background: var(--surface); border-top: 1px solid var(--border);
          padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 32px;
          color: var(--text);
        }
        .btn-primary {
          padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700;
          border: none; background: var(--brand-primary); color: white; font-family: inherit; letter-spacing: -0.005em;
          box-shadow: 0 4px 14px rgba(30,64,175,0.25); cursor: pointer; transition: all 0.15s;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(30,64,175,0.3); }
        .btn-primary:disabled { background: var(--surface-2); color: var(--text-tertiary); box-shadow: none; cursor: not-allowed; transform: none; }
        .btn-ghost { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-family: inherit; }
        .btn-ghost:hover { color: var(--text); background: var(--surface-2); }

        /* Welcome */
        .ob-hero-art { width: 160px; height: 160px; margin: 0 auto 32px; position: relative; }
        .ring { position: absolute; inset: 0; border: 8px solid var(--brand-primary); border-radius: 50%; animation: obPulse 2s ease-in-out infinite; }
        .r2 { inset: 16px; border-width: 4px; border-color: var(--brand-accent); animation-delay: 0.3s; opacity: 0.6; }
        .center { position: absolute; inset: 32px; background: var(--brand-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 32px rgba(30,64,175,0.25); }
        @keyframes obPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.7; } }
        .ob-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
        .ob-feat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; color: var(--text); }
        .ob-feat-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
        .ob-feat-sub { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }

        /* Leagues */
        .league-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .league-card {
          background: var(--surface); border: 2px solid var(--border); border-radius: 14px; padding: 20px;
          cursor: pointer; transition: all 0.15s; text-align: left; position: relative; display: flex; flex-direction: column; gap: 8px;
          color: var(--text);
        }
        .league-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
        .league-card.selected { border-color: var(--brand-primary); box-shadow: 0 8px 24px rgba(30,64,175,0.15); }
        .league-card.selected::after {
          content: '✓'; position: absolute; top: 12px; right: 12px;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--brand-primary); color: white;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .league-flag {
          width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1), inset 0 -3px 0 rgba(0,0,0,0.12);
        }
        .league-name { font-size: 15px; font-weight: 800; letter-spacing: -0.01em; }
        .league-sport { font-size: 12px; color: var(--text-tertiary); font-weight: 600; }

        /* Teams */
        .team-search {
          width: 100%; padding: 12px 16px 12px 40px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 14px; color: var(--text); font-family: inherit; margin-bottom: 16px; outline: none;
        }
        .team-search:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(31,63,204,0.15); }
        .league-tabs { display: flex; gap: 6px; margin-bottom: 16px; overflow-x: auto; }
        .league-tab {
          padding: 6px 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border);
          font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .league-tab:hover { border-color: var(--border-strong); color: var(--text); }
        .league-tab.active { background: var(--brand-primary); color: white; border-color: var(--brand-primary); }
        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .team-card-ob {
          background: var(--surface); border: 2px solid var(--border); border-radius: 12px; padding: 16px 12px;
          cursor: pointer; transition: all 0.15s; text-align: center; position: relative;
          color: var(--text);
        }
        .team-card-ob:hover { border-color: var(--border-strong); transform: translateY(-2px); }
        .team-card-ob.selected { border-color: var(--brand-primary); }
        .team-card-ob.selected::after {
          content: '✓'; position: absolute; top: 8px; right: 8px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--brand-primary); color: white;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .team-logo-ob {
          display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
        }
        .team-name-ob { font-size: 12px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3; }
        .team-league-ob { font-size: 10px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px; }
        .selected-bar {
          background: var(--surface-2); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-height: 56px;
        }
        .selected-label { font-size: 12px; font-weight: 700; color: var(--text-tertiary); letter-spacing: 0.05em; text-transform: uppercase; }
        .selected-chip {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 4px 4px 8px;
          background: var(--surface); border: 1px solid var(--border); border-radius: 999px; font-size: 12px; font-weight: 700;
        }
        .chip-x {
          width: 18px; height: 18px; border-radius: 50%; background: var(--surface-2); border: none;
          color: var(--text-tertiary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px;
        }
        .chip-x:hover { background: var(--text); color: white; }

        /* Notifs */
        .notif-list { display: flex; flex-direction: column; gap: 12px; }
        .notif-row {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 16px 18px; display: flex; align-items: center; gap: 14px;
          color: var(--text);
        }
        .switch {
          position: relative; width: 44px; height: 24px; flex-shrink: 0;
          background: var(--surface-2); border-radius: 999px; cursor: pointer; transition: background 0.15s; border: 1px solid var(--border);
        }
        .switch.on { background: var(--brand-primary); border-color: var(--brand-primary); }
        .switch::after {
          content: ''; position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.18s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .switch.on::after { transform: translateX(20px); }

        /* Done */
        .ob-done-art {
          width: 120px; height: 120px; border-radius: 50%; background: var(--brand-primary); color: white;
          display: inline-flex; align-items: center; justify-content: center; margin-bottom: 28px;
          box-shadow: 0 16px 40px rgba(30,64,175,0.3); animation: doneIn 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes doneIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        .ob-summary {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px;
          margin: 24px auto; width: 100%; max-width: 480px; text-align: left;
        }
        .ob-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .ob-summary-row:last-child { border-bottom: none; }
        .ob-summary-label { font-size: 12px; color: var(--text-tertiary); font-weight: 600; }
        .ob-summary-value { font-size: 14px; font-weight: 700; }

        @media (max-width: 700px) {
          .ob-top { padding: 16px 20px; gap: 12px; }
          .ob-main { padding: 24px 20px 0; }
          .ob-title { font-size: 24px; }
          .ob-features { grid-template-columns: 1fr; }
          .league-grid { grid-template-columns: repeat(2, 1fr); }
          .team-grid { grid-template-columns: repeat(3, 1fr); }
          .ob-foot { padding: 12px 20px; }
        }
        @media (max-width: 420px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
