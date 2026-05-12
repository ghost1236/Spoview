import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/login" style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 32, display: "inline-block" }}>← 로그인으로 돌아가기</Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="var(--brand-primary)"/><path d="M 8 12 A 8 8 0 0 1 22 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M 10 22 A 8 8 0 0 0 24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)"/></svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-tertiary)" }}>Spoview</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 4 }}>개인정보 처리방침</h1>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 40 }}>최종 수정일: 2026년 1월 1일 | 시행일: 2026년 1월 1일</p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Spoview(이하 "서비스")는 이용자의 개인정보를 중요시하며,
            「개인정보 보호법」을 준수하고 있습니다. 본 방침을 통해 수집하는 개인정보의 항목,
            이용 목적, 보관 기간 등을 안내합니다.
          </div>
        </div>

        <Section num="1" title="수집하는 개인정보">
          <Table headers={["항목", "수집 방법", "필수 여부"]} rows={[
            ["닉네임", "소셜 로그인 시 자동 수집", "필수"],
            ["이메일 주소", "소셜 로그인 시 자동 수집", "필수"],
            ["프로필 이미지", "소셜 로그인 시 자동 수집", "선택"],
            ["소셜 계정 고유 식별자", "소셜 로그인 시 자동 수집", "필수"],
            ["구독 팀 정보", "서비스 이용 중 설정", "선택"],
            ["알림 설정", "서비스 이용 중 설정", "선택"],
          ]} />
        </Section>

        <Section num="2" title="개인정보의 이용 목적">
          <ul style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li>서비스 회원 식별 및 인증</li>
            <li>맞춤형 스포츠 정보 제공 (구독 팀 기반 대시보드)</li>
            <li>커뮤니티 게시글 작성자 표시</li>
            <li>웹 푸시 알림 발송 (경기 시작, 득점, 결과)</li>
            <li>서비스 개선 및 이용 통계 분석</li>
          </ul>
        </Section>

        <Section num="3" title="개인정보의 보유 및 파기">
          <Table headers={["항목", "보유 기간", "파기 방법"]} rows={[
            ["회원 정보", "회원 탈퇴 시 즉시 삭제", "DB에서 영구 삭제"],
            ["서비스 이용 기록", "3개월", "자동 삭제"],
            ["부정 이용 방지 기록", "1년", "자동 삭제"],
            ["게시글/댓글", "회원 탈퇴 시 삭제", "DB에서 영구 삭제"],
          ]} />
        </Section>

        <Section num="4" title="개인정보의 제3자 제공">
          Spoview는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
          다만, 다음의 경우에는 예외적으로 제공할 수 있습니다.
          <ul style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의해 요청이 있는 경우</li>
          </ul>
        </Section>

        <Section num="5" title="개인정보 처리 위탁">
          <Table headers={["수탁업체", "위탁 업무", "보유 기간"]} rows={[
            ["카카오", "소셜 로그인 인증", "회원 탈퇴 시"],
            ["네이버", "소셜 로그인 인증", "회원 탈퇴 시"],
            ["Google", "소셜 로그인 인증, 광고(AdSense)", "회원 탈퇴 시"],
            ["Naver Cloud", "이미지 파일 저장", "파일 삭제 시"],
          ]} />
        </Section>

        <Section num="6" title="이용자의 권리">
          <ul style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li>개인정보 열람, 수정, 삭제 요청</li>
            <li>서비스 탈퇴를 통한 개인정보 즉시 삭제</li>
            <li>알림(푸시) 수신 동의 철회</li>
            <li>마이페이지에서 구독 팀 및 알림 설정 직접 변경</li>
          </ul>
        </Section>

        <Section num="7" title="쿠키 및 자동 수집 정보">
          서비스는 다음 정보를 자동으로 수집합니다.
          <ul style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li><strong>로컬 스토리지</strong>: 테마 설정, 구독 팀 정보 (비로그인 시)</li>
            <li><strong>세션 쿠키</strong>: 로그인 상태 유지 (JWT)</li>
            <li><strong>Push Subscription</strong>: 웹 푸시 알림 발송용</li>
          </ul>
          Google AdSense를 통해 제3자 쿠키가 사용될 수 있습니다.
        </Section>

        <Section num="8" title="개인정보 보호책임자">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 14 }}>이메일: <strong>smiling1236@gmail.com</strong></div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>
              개인정보 관련 문의, 열람/삭제 요청은 위 이메일로 연락해주세요.
            </div>
          </div>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)" }}>
          <span>&copy; 2026 Spoview. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/about" style={{ color: "var(--text-tertiary)" }}>서비스 소개</Link>
            <Link href="/terms" style={{ color: "var(--text-tertiary)" }}>이용약관</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "var(--text-tertiary)", flexShrink: 0 }}>{num}</span>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 36 }}>{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", background: "var(--surface)", borderBottom: "2px solid var(--border)", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
