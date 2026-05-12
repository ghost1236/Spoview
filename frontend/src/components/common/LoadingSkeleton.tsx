// ============================================
// LoadingSkeleton.tsx
// 데이터를 불러오는 동안 보여주는 로딩 애니메이션 컴포넌트들이에요
// 실제 콘텐츠가 표시되기 전까지 회색 막대로 레이아웃을 미리 보여줘요
// CSS 변수(--surface, --surface-2, --border)를 사용해 다크모드를 지원해요
// ============================================

// 경기 카드 하나가 로딩 중일 때 보여주는 스켈레톤이에요
export function MatchCardSkeleton() {
  return (
    // sv-card 클래스: --surface 배경, --border 테두리, --shadow 그림자를 자동 적용해요
    <div className="sv-card rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        {/* 날짜/리그명 위치에 회색 막대를 보여줘요 */}
        <div className="h-3 w-16 rounded" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-10 rounded" style={{ background: "var(--surface-2)" }} />
      </div>
      <div className="flex items-center justify-between">
        {/* 홈팀 이름 위치 */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="h-4 w-16 rounded" style={{ background: "var(--surface-2)" }} />
        </div>
        {/* 스코어 위치 */}
        <div className="px-4">
          <div className="h-6 w-12 rounded" style={{ background: "var(--surface-2)" }} />
        </div>
        {/* 원정팀 이름 위치 */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="h-4 w-16 rounded" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>
    </div>
  );
}

// 순위표가 로딩 중일 때 보여주는 스켈레톤이에요 (8행)
export function StandingsSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          {/* 순위 번호, 팀명, 승/패/승률 자리를 회색 막대로 채워요 */}
          <div className="h-4 w-6 rounded" style={{ background: "var(--surface-2)" }} />
          <div className="h-4 w-24 rounded" style={{ background: "var(--surface-2)" }} />
          <div className="flex-1" />
          <div className="h-4 w-8 rounded" style={{ background: "var(--surface-2)" }} />
          <div className="h-4 w-8 rounded" style={{ background: "var(--surface-2)" }} />
          <div className="h-4 w-8 rounded" style={{ background: "var(--surface-2)" }} />
        </div>
      ))}
    </div>
  );
}

// 게시글 목록이 로딩 중일 때 보여주는 스켈레톤이에요 (5행)
export function PostListSkeleton() {
  return (
    // divide-y: 각 행 사이에 구분선을 그어요
    // borderColor를 CSS 변수로 지정해 다크모드에서도 올바른 색이 나와요
    <div className="animate-pulse divide-y" style={{ borderColor: "var(--border)" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="px-4 py-3 space-y-2">
          <div className="flex gap-2">
            {/* 카테고리 태그와 제목 자리 */}
            <div className="h-4 w-12 rounded" style={{ background: "var(--surface-2)" }} />
            <div className="h-4 w-48 rounded" style={{ background: "var(--surface-2)" }} />
          </div>
          <div className="flex gap-3">
            {/* 작성자, 날짜, 댓글 수 자리 */}
            <div className="h-3 w-16 rounded" style={{ background: "var(--surface-2)" }} />
            <div className="h-3 w-12 rounded" style={{ background: "var(--surface-2)" }} />
            <div className="h-3 w-10 rounded" style={{ background: "var(--surface-2)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
