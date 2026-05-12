"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore, type NotifSettings } from "./store";
import { getTodayMatches, type Match } from "./api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Convert URL-safe base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Request browser notification permission
export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

// Register Service Worker and subscribe to push
export async function registerServiceWorker(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  if (!VAPID_PUBLIC_KEY) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;

    // Subscribe
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    return subscription;
  } catch (e) {
    console.error("Service Worker registration failed:", e);
    return null;
  }
}

// Send subscription to backend
async function sendSubscriptionToBackend(subscription: PushSubscription) {
  try {
    await fetch("/api/v1/notifications/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: JSON.stringify(subscription) }),
    });
  } catch {}
}

// Send a local browser notification (fallback when SW not available)
function sendLocalNotification(title: string, body: string, tag?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico", tag: tag || `spoview-${Date.now()}` });
  } catch {}
}

const LN: Record<string, string> = {
  epl: "EPL", laliga: "라리가", bundesliga: "분데스리가", seriea: "세리에A", ligue1: "리그앙",
  kleague1: "K리그1", kleague2: "K리그2", kbo: "KBO", mlb: "MLB",
};

export function useMatchNotifications() {
  const notifSettings = useAppStore(s => s.notifSettings);
  const setNotifPermission = useAppStore(s => s.setNotifPermission);
  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const subs = subscriptionsByUser[currentUserId || "_guest"] || [];

  const prevMatchStates = useRef<Map<number, { status: string; homeScore: number; awayScore: number }>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swRegistered = useRef(false);

  const myCodes = new Set(subs.map(t => t.teamCode));

  // Register SW and push subscription on mount
  useEffect(() => {
    if (swRegistered.current) return;
    if (!("Notification" in window)) return;

    const setup = async () => {
      const perm = Notification.permission;
      setNotifPermission(perm as any);

      if (perm === "granted" && VAPID_PUBLIC_KEY) {
        const subscription = await registerServiceWorker();
        if (subscription) {
          await sendSubscriptionToBackend(subscription);
          swRegistered.current = true;
        }
      }
    };
    setup();
  }, [setNotifPermission]);

  const checkMatches = useCallback(async () => {
    if (subs.length === 0) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
      const matches = await getTodayMatches();
      const myMatches = matches.filter(m =>
        myCodes.has(m.homeTeam.teamCode) || myCodes.has(m.awayTeam.teamCode)
      );

      for (const m of myMatches) {
        const prev = prevMatchStates.current.get(m.id);
        const league = LN[m.leagueCode] || m.leagueCode;
        const matchTitle = `${m.homeTeam.nameKo} vs ${m.awayTeam.nameKo}`;

        if (!prev) {
          prevMatchStates.current.set(m.id, {
            status: m.status,
            homeScore: m.homeScore ?? 0,
            awayScore: m.awayScore ?? 0,
          });
          continue;
        }

        // Kickoff
        if (notifSettings.kickoff && prev.status !== "LIVE" && m.status === "LIVE") {
          sendLocalNotification(`${league} 경기 시작!`, `${matchTitle} 경기가 시작되었습니다`, `kickoff-${m.id}`);
        }

        // Goal
        if (notifSettings.goal && m.status === "LIVE") {
          const newHS = m.homeScore ?? 0;
          const newAS = m.awayScore ?? 0;
          if (newHS !== prev.homeScore || newAS !== prev.awayScore) {
            const scorer = newHS > prev.homeScore ? m.homeTeam.nameKo : m.awayTeam.nameKo;
            sendLocalNotification(`${scorer} 득점!`, `${m.homeTeam.nameKo} ${newHS} : ${newAS} ${m.awayTeam.nameKo}`, `goal-${m.id}-${newHS}-${newAS}`);
          }
        }

        // Result
        if (notifSettings.result && prev.status === "LIVE" && m.status === "FINISHED") {
          sendLocalNotification(`${league} 경기 종료`, `${m.homeTeam.nameKo} ${m.homeScore} : ${m.awayScore} ${m.awayTeam.nameKo}`, `result-${m.id}`);
        }

        prevMatchStates.current.set(m.id, {
          status: m.status,
          homeScore: m.homeScore ?? 0,
          awayScore: m.awayScore ?? 0,
        });
      }
    } catch {}
  }, [subs.length, notifSettings.kickoff, notifSettings.goal, notifSettings.result]);

  useEffect(() => {
    if (subs.length === 0) return;
    if (!notifSettings.kickoff && !notifSettings.goal && !notifSettings.result) return;

    checkMatches();
    intervalRef.current = setInterval(checkMatches, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [subs.length, checkMatches]);
}
