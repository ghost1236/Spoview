"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/lib/useUser";

const MENU = [
  { href: "/", label: "홈", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { href: "/teams", label: "내 팀", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", extra: "M23 21v-2a4 4 0 0 0-3-3.87", extra2: "M16 3.13a4 4 0 0 1 0 7.75", circle: { cx: 9, cy: 7, r: 4 } },
  { href: "/community", label: "커뮤니티", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userName } = useUser();

  return (
    <aside style={{
      borderRight: "1px solid var(--border)", padding: "24px 16px",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      display: "flex", flexDirection: "column",
      background: "var(--bg)", color: "var(--text)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 28, padding: "0 8px" }}>
        <svg width="28" height="28" viewBox="0 0 32 32" style={{ display: "block", flexShrink: 0 }}>
          <rect width="32" height="32" rx="8" fill="var(--brand-primary)" />
          <path d="M 8 12 A 8 8 0 0 1 22 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 10 22 A 8 8 0 0 0 24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)" />
        </svg>
        <span>스포뷰</span>
      </div>

      {/* Nav */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-tertiary)", textTransform: "uppercase" as const, padding: "0 8px", marginBottom: 8 }}>메뉴</div>
        {MENU.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 10px", borderRadius: 8,
              fontSize: 14, fontWeight: isActive ? 600 : 500,
              color: isActive ? "#fff" : "var(--text-secondary)",
              background: isActive ? "var(--brand-primary)" : "transparent",
              boxShadow: isActive ? "0 4px 14px rgba(30,64,175,0.25)" : "none",
              transition: "all 0.15s",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={item.icon} />
                {item.extra && <path d={item.extra} />}
                {item.extra2 && <path d={item.extra2} />}
                {item.circle && <circle cx={item.circle.cx} cy={item.circle.cy} r={item.circle.r} />}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User */}
      {userName && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8 }}>
          <Link href="/mypage" style={{
            display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0,
            color: "var(--text-secondary)",
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--brand-primary)", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 11, flexShrink: 0,
            }}>{userName.charAt(0)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{userName}</div>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="로그아웃"
            style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "1px solid transparent", cursor: "pointer",
              color: "var(--text-tertiary)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
