"use client";

// ============================================
// mypage/page.tsx
// 마이페이지 화면을 담당하는 파일이에요
// 프로필 정보, 팬 레벨, 구독 팀 목록, 알림 설정을 보여줘요
// ============================================

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore, type NotifSettings } from "@/lib/store";
import { requestNotifPermission } from "@/lib/useNotifications";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { signOut } from "next-auth/react";
import { TeamLogo } from "@/components/common/TeamLogo";
import { FanLevelBadge } from "@/components/common/FanLevelBadge";
import { getFanLevel, type FanLevel } from "@/lib/api";

export default function MyPage() {
  const { isLoggedIn, userName } = useUser();
  const removeSubscription = useAppStore(s => s.removeSubscription);
  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const localSubscriptions = subscriptionsByUser[currentUserId || "_guest"] || [];
  const router = useRouter();

  // next-auth 세션에서 로그인 토큰(열쇠)을 가져와요
  // 이 토큰이 있어야 서버에 "내 팬 레벨 알려줘" 요청을 보낼 수 있어요
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  // 팬 레벨 데이터를 저장하는 상자예요
  // null이면 아직 서버에서 데이터를 받아오지 못한 상태예요
  const [fanLevel, setFanLevel] = useState<FanLevel | null>(null);

  // 화면이 처음 열리거나 토큰이 바뀔 때 팬 레벨을 불러와요
  useEffect(() => {
    // 로그인 상태가 아니면 서버에 요청하지 않아요 (토큰이 없으면 서버가 거부해요)
    if (!token) return;

    // 서버에서 팬 레벨 데이터를 가져와서 상태에 저장해요
    getFanLevel(token)
      .then((data) => setFanLevel(data))
      .catch(() => {
        // 오류가 나도 앱이 멈추지 않도록 조용히 처리해요
        // (팬 레벨을 못 불러와도 나머지 마이페이지는 정상 동작해야 해요)
        setFanLevel(null);
      });
  }, [token]); // token이 바뀔 때만 다시 실행해요

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-black">마이페이지</h1>

      {/* 프로필 카드: 이름과 로그인 상태를 보여줘요 */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-white">
            {userName?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="font-bold text-lg">{userName || "게스트"}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {isLoggedIn ? "로그인 중" : "비로그인 상태"}
            </p>
          </div>
        </div>
      </div>

      {/* 팬 레벨 카드: 로그인 상태이고 데이터를 받아왔을 때만 보여줘요 */}
      {isLoggedIn && fanLevel && (
        <div className="card p-6">
          <h3 className="font-bold mb-3">팬 레벨</h3>
          {/* FanLevelBadge 컴포넌트에 서버에서 받은 팬 레벨 정보를 전달해요 */}
          <FanLevelBadge
            level={fanLevel.level}
            levelName={fanLevel.levelName}
            totalPoints={fanLevel.totalPoints}
            nextLevelPoints={fanLevel.nextLevelPoints}
            progress={fanLevel.progress}
          />
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">구독 팀 ({localSubscriptions.length})</h3>
          <button onClick={() => router.push("/onboarding")} className="text-sm text-indigo-500 hover:underline">
            팀 추가
          </button>
        </div>

        {localSubscriptions.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">구독 중인 팀이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {localSubscriptions.map((team) => (
              <div key={team.teamCode} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <TeamLogo teamCode={team.teamCode} name={team.nameKo} size={32} />
                  <div>
                    <span className="text-sm font-medium">{team.nameKo}</span>
                    <span className="text-xs text-[var(--text-secondary)] ml-2">{team.leagueCode.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => removeSubscription(team.teamCode)} className="text-xs text-rose-500 hover:underline">
                  구독 취소
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <NotifSettingsSection />

      {/* 로그아웃 */}
      {isLoggedIn && (
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3 rounded-xl text-sm font-semibold text-rose-500 border transition hover:opacity-80"
          style={{ borderColor: "var(--border-strong)", background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          로그아웃
        </button>
      )}
    </div>
  );
}

const NOTIF_ITEMS: { key: keyof NotifSettings; title: string; sub: string }[] = [
  { key: "kickoff", title: "경기 시작", sub: "내 팀 경기가 시작되면 알림을 받아요" },
  { key: "goal", title: "득점/주요 이벤트", sub: "골/홈런 등 주요 순간을 실시간으로" },
  { key: "result", title: "경기 결과", sub: "경기가 끝나면 결과 요약을 보내드려요" },
  { key: "transfer", title: "이적/소식", sub: "관심 팀의 이적과 부상 소식" },
  { key: "community", title: "커뮤니티 활동", sub: "내 글에 좋아요/댓글이 달리면" },
];

function NotifSettingsSection() {
  const notifSettings = useAppStore(s => s.notifSettings);
  const setNotifSettings = useAppStore(s => s.setNotifSettings);
  const notifPermission = useAppStore(s => s.notifPermission);
  const setNotifPermission = useAppStore(s => s.setNotifPermission);

  const handleToggle = async (key: keyof NotifSettings) => {
    const newVal = !notifSettings[key];
    // If enabling and no permission yet, request it
    if (newVal && notifPermission !== "granted") {
      const perm = await requestNotifPermission();
      setNotifPermission(perm as any);
      if (perm !== "granted") return;
    }
    setNotifSettings({ ...notifSettings, [key]: newVal });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">알림 설정</h3>
        {notifPermission === "denied" && (
          <span className="text-xs text-rose-500">브라우저에서 알림이 차단되었습니다</span>
        )}
        {notifPermission === "default" && (
          <button onClick={async () => { const p = await requestNotifPermission(); setNotifPermission(p as any); }}
            className="text-sm text-indigo-500 hover:underline">
            알림 허용하기
          </button>
        )}
      </div>
      <div className="space-y-3">
        {NOTIF_ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="text-xs text-[var(--text-secondary)]">{item.sub}</div>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              style={{
                position: "relative", width: 44, height: 24, flexShrink: 0,
                background: notifSettings[item.key] ? "var(--brand-primary)" : "var(--surface-2)",
                borderRadius: 999, cursor: "pointer", transition: "background 0.15s",
                border: notifSettings[item.key] ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
              }}>
              <span style={{
                position: "absolute", top: 2, left: notifSettings[item.key] ? 22 : 2,
                width: 18, height: 18, borderRadius: "50%", background: "white",
                transition: "left 0.18s", boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
