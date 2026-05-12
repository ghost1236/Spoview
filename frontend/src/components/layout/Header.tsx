"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "../common/ThemeToggle";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [testUser, setTestUser] = useState<{ name: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("test-user");
    if (stored) setTestUser(JSON.parse(stored));
  }, []);

  const isLoggedIn = session || testUser;
  const userName = session?.user?.name || testUser?.name;

  const handleLogout = () => {
    if (testUser) {
      localStorage.removeItem("test-token");
      localStorage.removeItem("test-user");
      setTestUser(null);
      router.push("/login");
    } else {
      signOut({ callbackUrl: "/login" });
    }
  };

  const navItems = [
    { href: "/", label: "홈", icon: "⚡" },
    { href: "/teams", label: "팀 정보", icon: "🏆" },
    { href: "/community", label: "커뮤니티", icon: "💬" },
    { href: "/mypage", label: "MY", icon: "👤" },
  ];

  return (
    {/* 헤더 배경은 CSS 변수 --bg를 반투명하게 적용해 다크모드에서도 자연스럽게 보여요 */}
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight">스포뷰</span>
          </Link>

          {/* 데스크톱 네비 */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  pathname === item.href
                    // 현재 페이지이면 인디고 색으로 강조하고, 아니면 보조 텍스트 색을 써요
                  // hover 효과는 CSS 변수로 지정된 sv-nav-item 스타일에서 처리할 수도 있어요
                  ? "bg-indigo-50 text-indigo-600"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{userName?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition">
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" className="gradient-accent text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition">
                로그인
              </Link>
            )}

            {/* 모바일 햄버거 메뉴 버튼 — hover 배경을 CSS 변수로 지정해요 */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-xl hover:bg-[var(--surface-2)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        {/* 모바일 드롭다운 메뉴 배경과 상단 구분선을 CSS 변수로 지정해요 */}
        <div className="sm:hidden px-4 py-3 space-y-1 border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                // 현재 페이지 메뉴 항목은 인디고 색으로 강조해요
                pathname === item.href ? "bg-indigo-50 text-indigo-600 font-medium" : "text-[var(--text-secondary)]"
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500">로그아웃</button>
          )}
        </div>
      )}
    </header>
  );
}
