import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/login" style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 32, display: "inline-block" }}>← 로그인으로 돌아가기</Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="var(--brand-primary)"/><path d="M 8 12 A 8 8 0 0 1 22 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M 10 22 A 8 8 0 0 0 24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="2.5" fill="var(--brand-accent)"/></svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-tertiary)" }}>Spoview</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 4 }}>이용약관</h1>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 40 }}>최종 수정일: 2026년 1월 1일 | 시행일: 2026년 1월 1일</p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            본 약관은 Spoview(이하 "서비스")의 이용에 관한 기본 사항을 규정합니다.
            서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
          </div>
        </div>

        <Section num="1" title="목적">
          이 약관은 Spoview가 제공하는 스포츠 정보 서비스의 이용 조건 및 절차,
          이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </Section>

        <Section num="2" title="용어의 정의">
          <ol style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li><strong>"서비스"</strong>란 Spoview가 제공하는 스포츠 경기 정보, 팀 통계, 커뮤니티 등 관련 서비스를 의미합니다.</li>
            <li><strong>"이용자"</strong>란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li><strong>"회원"</strong>이란 소셜 로그인을 통해 가입한 자로서, 서비스가 제공하는 전체 기능을 이용할 수 있는 자를 말합니다.</li>
          </ol>
        </Section>

        <Section num="3" title="서비스의 제공">
          서비스는 다음과 같은 기능을 제공합니다.
          <ul style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li>실시간 스포츠 경기 정보 제공 (축구, 야구)</li>
            <li>팀별 시즌 통계 및 리그 순위 정보</li>
            <li>팬 커뮤니티 게시판 (게시글, 댓글, 좋아요)</li>
            <li>맞춤형 팀 구독 및 알림 서비스</li>
            <li>라이트/다크 테마 지원</li>
          </ul>
        </Section>

        <Section num="4" title="회원가입 및 계정">
          회원가입은 카카오, 네이버, Google 소셜 로그인을 통해 이루어집니다.
          서비스 이용을 위해 필요한 최소한의 정보(닉네임, 이메일)만 수집하며,
          비로그인 상태에서도 팀 구독 등 일부 기능을 이용할 수 있습니다.
        </Section>

        <Section num="5" title="이용자의 의무">
          <ol style={{ paddingLeft: 20, lineHeight: 2.2, margin: "8px 0 0" }}>
            <li>타인의 정보를 도용하여 서비스를 이용해서는 안 됩니다.</li>
            <li>커뮤니티에서 비방, 욕설, 차별 발언, 허위정보를 게시해서는 안 됩니다.</li>
            <li>서비스의 안정적 운영을 방해하는 행위(스크래핑, DoS 등)를 해서는 안 됩니다.</li>
            <li>게시물에 대한 저작권 및 법적 책임은 작성자에게 있습니다.</li>
          </ol>
        </Section>

        <Section num="6" title="서비스 변경 및 중단">
          서비스는 운영상 필요에 따라 사전 공지 후 서비스의 전부 또는 일부를 변경하거나
          중단할 수 있습니다. 무료로 제공되는 서비스의 변경·중단에 대해서는 별도의 보상을 하지 않습니다.
        </Section>

        <Section num="7" title="면책조항">
          서비스가 제공하는 경기 정보, 통계 데이터는 외부 API(API-Football, MLB Stats API, KBO)를 통해
          수집되며, 데이터의 정확성을 완전히 보장하지 않습니다. 실시간 데이터는 수집 주기에 따라 지연이
          발생할 수 있습니다.
        </Section>

        <Section num="8" title="분쟁 해결">
          본 약관에 관한 분쟁은 대한민국 법률을 적용하며, 관할 법원은 서비스 운영자의
          소재지를 관할하는 법원으로 합니다.
        </Section>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)" }}>
          <span>&copy; 2026 Spoview. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/about" style={{ color: "var(--text-tertiary)" }}>서비스 소개</Link>
            <Link href="/privacy" style={{ color: "var(--text-tertiary)" }}>개인정보처리방침</Link>
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
        제{num}조 ({title})
      </h2>
      <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 36 }}>{children}</div>
    </div>
  );
}
