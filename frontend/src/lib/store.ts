import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team } from "./api";

export interface NotifSettings {
  kickoff: boolean;   // 경기 시작
  goal: boolean;      // 득점/주요 이벤트
  result: boolean;    // 경기 결과
  transfer: boolean;  // 이적/소식
  community: boolean; // 커뮤니티 활동
}

interface AppStore {
  // 현재 유저 ID (계정별 구독 분리용)
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;

  // 계정별 구독 팀 (userId → Team[])
  subscriptionsByUser: Record<string, Team[]>;

  // 현재 유저의 구독 팀 접근
  getSubscriptions: () => Team[];
  addSubscription: (team: Team) => void;
  removeSubscription: (teamCode: string) => void;
  setSubscriptions: (teams: Team[]) => void;

  // 알림 설정
  notifSettings: NotifSettings;
  setNotifSettings: (settings: NotifSettings) => void;
  notifPermission: "default" | "granted" | "denied";
  setNotifPermission: (p: "default" | "granted" | "denied") => void;

  // 선택 필터
  selectedLeague: string | null;
  setSelectedLeague: (league: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      setCurrentUserId: (id) => set({ currentUserId: id }),

      subscriptionsByUser: {},

      getSubscriptions: () => {
        const { currentUserId, subscriptionsByUser } = get();
        const key = currentUserId || "_guest";
        return subscriptionsByUser[key] || [];
      },

      addSubscription: (team) =>
        set((state) => {
          const key = state.currentUserId || "_guest";
          const current = state.subscriptionsByUser[key] || [];
          if (current.some((t) => t.teamCode === team.teamCode)) return state;
          return {
            subscriptionsByUser: {
              ...state.subscriptionsByUser,
              [key]: [...current, team],
            },
          };
        }),

      removeSubscription: (teamCode) =>
        set((state) => {
          const key = state.currentUserId || "_guest";
          const current = state.subscriptionsByUser[key] || [];
          return {
            subscriptionsByUser: {
              ...state.subscriptionsByUser,
              [key]: current.filter((t) => t.teamCode !== teamCode),
            },
          };
        }),

      setSubscriptions: (teams) =>
        set((state) => {
          const key = state.currentUserId || "_guest";
          return {
            subscriptionsByUser: {
              ...state.subscriptionsByUser,
              [key]: teams,
            },
          };
        }),

      notifSettings: { kickoff: true, goal: true, result: true, transfer: false, community: false },
      setNotifSettings: (settings) => set({ notifSettings: settings }),
      notifPermission: "default",
      setNotifPermission: (p) => set({ notifPermission: p }),

      selectedLeague: null,
      setSelectedLeague: (league) => set({ selectedLeague: league }),
    }),
    { name: "sportshub-store" }
  )
);
