"use client";

import type { Standing } from "@/lib/api";
import { ZONE_COLORS } from "@/lib/constants";

interface Props {
  standings: Standing[];
  sportType: string;
  highlightTeamCodes?: string[];
}

export function StandingsTable({ standings, sportType, highlightTeamCodes = [] }: Props) {
  const isFootball = sportType === "FOOTBALL";
  const zones = Array.from(new Set(standings.map((s) => s.zoneDescription).filter(Boolean))) as string[];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {/* 헤더 행 — 테두리와 텍스트 색상을 CSS 변수로 지정해 다크모드에서도 올바르게 보여요 */}
            <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <th className="py-2 px-1 text-left w-4"></th>
              <th className="py-2 px-2 text-left w-8">#</th>
              <th className="py-2 px-2 text-left">팀</th>
              <th className="py-2 px-2 text-center">경기</th>
              <th className="py-2 px-2 text-center">승</th>
              {isFootball && <th className="py-2 px-2 text-center">무</th>}
              <th className="py-2 px-2 text-center">패</th>
              {isFootball ? (
                <>
                  <th className="py-2 px-2 text-center">득실</th>
                  <th className="py-2 px-2 text-center font-bold">승점</th>
                </>
              ) : (
                <>
                  <th className="py-2 px-2 text-center">승률</th>
                  <th className="py-2 px-2 text-center">차이</th>
                </>
              )}
              <th className="py-2 px-2 text-center hidden sm:table-cell">폼</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const zone = s.zoneDescription ? ZONE_COLORS[s.zoneDescription] : null;
              const isHighlighted = highlightTeamCodes.includes(s.team.teamCode);

              return (
                <tr
                  key={s.team.teamCode}
                  // 구독 중인 팀 행은 파란 배경으로 강조해요
                  // 테두리는 CSS 변수 --border로 다크모드를 지원해요
                  className="border-b"
                  style={{
                    borderColor: "var(--border)",
                    // 하이라이트 배경: 다크모드에서는 --surface-2를 블루 계열로 쓰면 충분해요
                    background: isHighlighted ? "var(--surface-2)" : undefined,
                  }}
                >
                  <td className="py-2 px-0">
                    {zone && (
                      <div
                        className="w-1 h-6 rounded-r"
                        style={{ backgroundColor: zone.color }}
                      />
                    )}
                  </td>
                  <td className="py-2 px-2 font-medium">{s.rank}</td>
                  <td className="py-2 px-2 font-medium">{s.team.nameKo}</td>
                  <td className="py-2 px-2 text-center">{s.played}</td>
                  <td className="py-2 px-2 text-center">{s.won}</td>
                  {isFootball && <td className="py-2 px-2 text-center">{s.drawn}</td>}
                  <td className="py-2 px-2 text-center">{s.lost}</td>
                  {isFootball ? (
                    <>
                      <td className="py-2 px-2 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                      <td className="py-2 px-2 text-center font-bold">{s.points}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2 text-center">{s.winningPct}</td>
                      <td className="py-2 px-2 text-center">{s.gamesBack}</td>
                    </>
                  )}
                  <td className="py-2 px-2 text-center hidden sm:table-cell">
                    {s.form && <FormBadge form={s.form} isFootball={isFootball} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {zones.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          {zones.map((z) => {
            const zone = ZONE_COLORS[z];
            if (!zone) return null;
            return (
              {/* 각 존의 색상 점 + 라벨 — 텍스트 색을 CSS 변수로 지정해요 */}
              <div key={z} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                {zone.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormBadge({ form, isFootball }: { form: string; isFootball: boolean }) {
  if (isFootball) {
    return (
      <div className="flex gap-0.5 justify-center">
        {form.split("").map((c, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold text-white ${
              c === "W" ? "bg-green-500" : c === "D" ? "bg-slate-400" : "bg-red-500"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    );
  }
  // 야구: streak code (W3, L2 등)
  const isWin = form.startsWith("W");
  return (
    <span className={`text-xs font-medium ${isWin ? "text-green-600" : "text-red-500"}`}>
      {form}
    </span>
  );
}
