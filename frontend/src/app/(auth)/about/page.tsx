import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 800, margin: "0 auto" }}>
        <Link href="/login" style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 32, display: "inline-block" }}>← 로그인으로 돌아가기</Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <svg width="40" height="40" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="var(--brand-primary)"/><path d="M 8 12 A 8 8 0 0 1 22 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M 10 22 A 8 8 0 0 0 24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)"/></svg>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>스포뷰</span>
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2, margin: "0 0 16px" }}>
          내가 응원하는 팀의<br/>모든 순간, 한 곳에서.
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          축구와 야구, 좋아하는 팀을 구독하면 실시간 경기, 순위, 통계, 커뮤니티까지 맞춤으로 모아드립니다.
        </p>
      </div>

      {/* Screenshot: Dashboard */}
      <div style={{ maxWidth: 1000, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
          <img src="/screenshots/cap_dashboard.png" alt="Spoview 대시보드" style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 48 }}>주요 기능</h2>

        <Feature
          title="맞춤 대시보드"
          desc="구독한 팀의 오늘 경기, 다가올 경기, 승무패 비율, 리그 순위를 한눈에 확인하세요. 경기 중에는 실시간 스코어가 표시됩니다."
          imgSrc="/screenshots/cap_dashboard.png"
          reverse={false}
        />
        <Feature
          title="팀 상세 분석"
          desc="순위 추이, 홈·원정 성적, 최근 득실 차트까지. 내 팀의 시즌 성적을 다양한 차트로 분석하세요."
          imgSrc="/screenshots/cap_teams.png"
          reverse={true}
        />
        <Feature
          title="팬 커뮤니티"
          desc="같은 팀 팬들과 경기 리뷰, 이적 소식, 자유 토론을 나눠보세요. 댓글, 좋아요, 이미지 첨부를 지원합니다."
          imgSrc="/screenshots/cap_community.png"
          reverse={false}
        />
        <Feature
          title="간편한 시작"
          desc="3초 만에 소셜 로그인 후, 관심 리그와 팀을 선택하면 바로 맞춤 피드가 만들어집니다."
          imgSrc="/screenshots/cap_onboarding.png"
          reverse={true}
        />
        <Feature
          title="다크모드 지원"
          desc="눈이 편한 다크모드를 지원합니다. 밤에도 편하게 경기를 확인하세요."
          imgSrc="/screenshots/cap_dark.png"
          reverse={false}
        />
      </div>

      {/* Leagues */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "60px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 32 }}>지원 리그</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { name: "EPL", sub: "잉글랜드 프리미어리그", color: "#3D195B" },
              { name: "라리가", sub: "스페인", color: "#EE3325" },
              { name: "분데스리가", sub: "독일", color: "#D20515" },
              { name: "세리에A", sub: "이탈리아", color: "#009A44" },
              { name: "리그앙", sub: "프랑스", color: "#1F3FCC" },
              { name: "K리그", sub: "한국 프로축구", color: "#1F8A4D" },
              { name: "KBO", sub: "한국 프로야구", color: "#D72631" },
              { name: "MLB", sub: "미국 메이저리그", color: "#002D72" },
              { name: "더 많은 리그", sub: "계속 추가 중", color: "#94A3B8" },
            ].map(l => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: l.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                  {l.name.slice(0, 3)}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{l.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>지금 바로 시작하세요</h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 32 }}>가입 절차 없이 소셜 계정으로 3초 만에 시작할 수 있습니다.</p>
        <Link href="/login" style={{
          display: "inline-block", padding: "14px 32px", borderRadius: 12,
          background: "var(--brand-primary)", color: "#fff", fontSize: 16, fontWeight: 700,
          boxShadow: "0 4px 14px rgba(30,64,175,0.25)",
        }}>로그인하고 시작하기 →</Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 8 }}>
          <Link href="/terms" style={{ color: "var(--text-tertiary)" }}>이용약관</Link>
          <Link href="/privacy" style={{ color: "var(--text-tertiary)" }}>개인정보처리방침</Link>
          <span>smiling1236@gmail.com</span>
        </div>
        &copy; 2026 Spoview. All rights reserved.
      </div>
    </div>
  );
}

function Feature({ title, desc, imgSrc, reverse }: { title: string; desc: string; imgSrc: string; reverse: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 40, alignItems: "center", marginBottom: 64,
      flexDirection: reverse ? "row-reverse" : "row",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>{desc}</p>
      </div>
      <div style={{ flex: 1.2, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        <img src={imgSrc} alt={title} style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}
