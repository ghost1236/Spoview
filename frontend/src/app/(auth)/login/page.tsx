"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="auth-layout">
      {/* Left: Brand stage */}
      <aside className="auth-stage" aria-hidden="true">
        <div className="stage-head">
          <svg width="36" height="36" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="white" fillOpacity="0.16"/>
            <rect x="2" y="2" width="28" height="28" rx="6" fill="white"/>
            <path d="M 8 12 A 8 8 0 0 1 22 12" stroke="var(--brand-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M 10 22 A 8 8 0 0 0 24 22" stroke="var(--brand-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)"/>
          </svg>
          <span>스포뷰</span>
        </div>

        <div className="stage-body">
          <span className="stage-eyebrow">
            <span className="stage-dot" />
            Now Live · 12 Matches
          </span>
          <h1>오늘 밤,<br/>당신의 팀이 <em>뛰고 있어요.</em></h1>
          <p className="stage-lead">
            EPL부터 KBO까지. 좋아하는 모든 팀의 경기 일정과 결과,
            팬들의 이야기를 한 곳에서 만나보세요.
          </p>

          <div className="live-card">
            <div className="live-row1">
              <span className="live-pulse" />
              <span>LIVE · EPL · 78&prime;</span>
            </div>
            <div className="live-row2">
              <div className="live-team">
                <span className="live-team-badge" style={{ background: "#132257" }}>TOT</span>
                <span>토트넘</span>
              </div>
              <span className="live-score tabular">2 — 1</span>
              <div className="live-team away">
                <span>맨유</span>
                <span className="live-team-badge" style={{ background: "#DA291C" }}>MUN</span>
              </div>
            </div>
            <div className="live-min">
              <span>손흥민 <strong>1G 1A</strong></span>
              <span>xG 2.4 vs 1.1</span>
            </div>
          </div>
        </div>

        <div className="stage-foot">
          <span>&copy; 2026 Spoview</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/about">서비스 소개</a>
            <a href="/privacy">개인정보처리방침</a>
          </div>
        </div>
      </aside>

      {/* Right: Form panel */}
      <main className="auth-form-panel">
        <div className="auth-form-body">
          <div className="form-eyebrow">Welcome to 스포뷰</div>
          <h1 className="form-title">3초 만에 시작하기 👋</h1>
          <p className="form-sub">
            가입 절차 없이 소셜 계정으로 바로 로그인하세요.<br/>
            다음 단계에서 좋아하는 팀을 골라드릴게요.
          </p>

          <div className="socials">
            {/* 카카오 */}
            <button
              onClick={() => signIn("kakao", { callbackUrl: "/" })}
              className="social-btn kakao"
            >
              <span className="social-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.79 1.85 5.24 4.62 6.62-.2.71-.74 2.66-.85 3.07-.13.51.19.5.4.36.16-.11 2.6-1.78 3.66-2.5.71.1 1.43.16 2.17.16 5.52 0 10-3.48 10-7.78S17.52 3 12 3z"/>
                </svg>
              </span>
              <span className="social-label">카카오로 시작하기</span>
              <span className="social-recommend">추천</span>
            </button>

            {/* 네이버 */}
            <button
              onClick={() => signIn("naver", { callbackUrl: "/" })}
              className="social-btn naver"
            >
              <span className="social-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"/>
                </svg>
              </span>
              <span className="social-label">네이버로 계속</span>
              <svg className="social-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="social-btn"
            >
              <span className="social-ico">
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.06-3.71H.96v2.33A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.94 10.71c-.18-.54-.29-1.12-.29-1.71s.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.98-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.98 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                </svg>
              </span>
              <span className="social-label">Google로 계속</span>
              <svg className="social-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          <p className="terms">
            로그인하면 스포뷰의 <a href="/terms">이용약관</a> 및<br/>
            <a href="/privacy">개인정보 처리방침</a>에 동의하게 됩니다.
          </p>
        </div>
      </main>

      <style jsx>{`
        .auth-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
        }

        .auth-stage {
          position: relative;
          background: linear-gradient(135deg, #0E1E66 0%, #1F3FCC 55%, #3B6AE8 100%);
          color: white;
          display: flex; flex-direction: column;
          padding: 40px 56px;
          overflow: hidden;
        }
        .auth-stage::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 20% 0%, rgba(255,255,255,0.18), transparent 50%),
            radial-gradient(circle at 90% 100%, rgba(59,130,246,0.35), transparent 50%);
          pointer-events: none;
        }
        .auth-stage::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 80px 80px; pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .stage-head {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 12px;
          font-size: 22px; font-weight: 800; letter-spacing: -0.02em;
          margin-bottom: auto;
        }
        .stage-body { position: relative; z-index: 2; margin: auto 0; }
        .stage-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 32px;
        }
        .stage-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ADE80; box-shadow: 0 0 8px rgba(74,222,128,0.6);
        }
        .auth-stage h1 {
          font-size: 64px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.05;
          margin: 0 0 28px;
        }
        .auth-stage h1 em {
          font-style: normal;
          background: linear-gradient(120deg, #DBEAFE, #93C5FD);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stage-lead {
          font-size: 20px; line-height: 1.65;
          color: rgba(255,255,255,0.78); max-width: 520px; margin: 0;
        }
        .live-card {
          position: relative; z-index: 2; margin-top: 36px;
          background: rgba(255,255,255,0.08); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 16px; padding: 16px 18px;
          max-width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.18);
        }
        .live-row1 {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #FECACA; margin-bottom: 16px;
        }
        .live-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: #EF4444; animation: livePulse 1.4s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        .live-row2 {
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 12px;
        }
        .live-team {
          display: flex; align-items: center; gap: 12px;
          font-weight: 700; font-size: 17px;
        }
        .live-team.away { justify-content: flex-end; }
        .live-team-badge {
          width: 40px; height: 40px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.18);
          color: white;
        }
        .live-score {
          font-size: 36px; font-weight: 800; letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums; color: white;
        }
        .live-min {
          margin-top: 10px; padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 14px; color: rgba(255,255,255,0.7);
        }
        .live-min strong { color: white; font-weight: 700; }
        .stage-foot {
          position: relative; z-index: 2; margin-top: auto; padding-top: 32px;
          color: rgba(255,255,255,0.55); font-size: 14px;
          display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .stage-foot a { color: rgba(255,255,255,0.75); font-weight: 600; }
        .stage-foot a:hover { color: white; }

        /* Form panel */
        .auth-form-panel {
          display: flex; flex-direction: column;
          padding: 40px 56px; overflow-y: auto;
          background: var(--bg); color: var(--text);
        }
        .auth-form-body {
          margin: auto 0; width: 100%; max-width: 400px;
          align-self: center; padding: 56px 0;
        }
        .form-eyebrow {
          font-size: 14px; font-weight: 700; letter-spacing: 0.08em;
          color: var(--brand-primary); text-transform: uppercase;
          margin-bottom: 14px;
        }
        .form-title {
          font-size: 38px; font-weight: 800;
          letter-spacing: -0.025em; line-height: 1.15;
          margin: 0 0 12px; color: var(--text);
        }
        .form-sub {
          font-size: 16px; color: var(--text-secondary);
          margin: 0 0 36px; line-height: 1.6;
        }

        /* Social buttons */
        .socials { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .social-btn {
          height: 56px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface);
          display: flex; align-items: center;
          padding: 0 20px; gap: 14px;
          font-size: 16px; font-weight: 700;
          color: var(--text); cursor: pointer; transition: all 0.15s;
          font-family: inherit; letter-spacing: -0.005em; width: 100%;
          position: relative;
        }
        .social-btn:hover {
          border-color: var(--border-strong);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        .social-ico {
          width: 22px; height: 22px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .social-label { flex: 1; text-align: left; }
        .social-arrow { color: var(--text-tertiary); transition: transform 0.15s; }
        .social-btn:hover .social-arrow { transform: translateX(2px); color: var(--text); }

        /* Kakao */
        .social-btn.kakao { background: #FEE500; color: #191600; border-color: #FEE500; }
        .social-recommend {
          background: rgba(25,22,0,0.12); color: #191600;
          font-size: 12px; font-weight: 800;
          padding: 4px 10px; border-radius: 4px; letter-spacing: 0.04em;
        }

        /* Naver */
        .social-btn.naver { background: #03C75A; color: white; border-color: #03C75A; }
        .social-btn.naver .social-arrow { color: rgba(255,255,255,0.7); }
        .social-btn.naver:hover .social-arrow { color: white; }

        .terms {
          margin-top: 28px;
          font-size: 13px; color: var(--text-tertiary);
          line-height: 1.6; text-align: center;
        }
        .terms a {
          color: var(--text-secondary); font-weight: 600;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-stage { display: none; }
          .auth-form-panel { padding: 32px 24px; min-height: 100vh; }
          .auth-form-body { padding: 32px 0; }
          .form-title { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
