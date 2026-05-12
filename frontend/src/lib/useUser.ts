"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "./store";
import { getSubscriptions } from "./api";

export function useUser() {
  const { data: session, status } = useSession();
  const { setCurrentUserId, setSubscriptions, currentUserId } = useAppStore();
  const [ready, setReady] = useState(false);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const testUser = typeof window !== "undefined" ? localStorage.getItem("test-user") : null;

    if (session) {
      const provider = (session as any).provider || "oauth";
      const providerId = (session as any).providerId || (session as any).backendUserId || session.user?.email;
      const uid = `${provider}_${providerId}`;
      setCurrentUserId(uid);

      const token = (session as any)?.accessToken;
      if (token && syncedRef.current !== uid) {
        syncedRef.current = uid;
        getSubscriptions(token)
          .then((teams) => setSubscriptions(teams))
          .catch(() => {});
      }
    } else if (testUser) {
      setCurrentUserId("test_1");
    } else {
      setCurrentUserId(null);
    }

    setReady(true);
  }, [session, status, setCurrentUserId, setSubscriptions]);

  const testUser = typeof window !== "undefined" ? localStorage.getItem("test-user") : null;
  const isLoggedIn = !!session || !!testUser;
  const token = (session as any)?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("test-token") : null);

  // 유저 이름: session에서 가져오거나 testUser에서 가져옴
  let userName: string | null = null;
  if (session?.user?.name) {
    userName = session.user.name;
  } else if (testUser) {
    try { userName = JSON.parse(testUser).name; } catch { userName = null; }
  }

  return { ready, isLoggedIn, token, userName, session, currentUserId };
}
