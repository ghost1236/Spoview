"use client";

interface Props {
  level: number;
  levelName: string;
  totalPoints: number;
  nextLevelPoints: number;
  progress: number;
}

const LEVEL_COLORS = [
  "from-gray-400 to-gray-500",    // Lv.1
  "from-green-400 to-green-600",   // Lv.2
  "from-blue-400 to-blue-600",    // Lv.3
  "from-purple-400 to-purple-600", // Lv.4
  "from-yellow-400 to-orange-500", // Lv.5
];

export function FanLevelBadge({ level, levelName, totalPoints, nextLevelPoints, progress }: Props) {
  const gradient = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];

  return (
    // 카드 전체 배경과 테두리를 CSS 변수로 처리해요 (라이트/다크 자동 전환)
    <div
      className="rounded-lg p-4 border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
          {level}
        </div>
        <div>
          <div className="font-semibold text-sm">{levelName}</div>
          {/* 보조 텍스트 색상도 CSS 변수로 처리해요 */}
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{totalPoints}P</div>
        </div>
      </div>

      {level < 5 && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            <span>Lv.{level + 1}까지</span>
            <span>{totalPoints}/{nextLevelPoints}P</span>
          </div>
          {/* 프로그레스 바 배경도 CSS 변수(surface-2)로 처리해요 */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
