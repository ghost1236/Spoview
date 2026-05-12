"use client";

import Link from "next/link";
import type { Match } from "@/lib/api";
import { formatDate } from "@/lib/constants";

interface Props {
  match: Match;
}

export function MatchCard({ match }: Props) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    {/* 카드 배경과 테두리를 CSS 변수로 처리해요 (라이트/다크 자동 전환) */}
    <div className="rounded-lg p-4 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-400">{formatDate(match.matchDate)}</span>
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        {isFinished && <span className="text-[10px] text-slate-400">종료</span>}
        {!isLive && !isFinished && <span className="text-[10px] text-slate-400">예정</span>}
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/team/${match.homeTeam.teamCode}`} className="flex-1 text-center hover:text-blue-600">
          <div className="font-medium text-xs">{match.homeTeam.nameKo}</div>
        </Link>

        <div className="px-4 text-center">
          {isFinished || isLive ? (
            <div className={`text-lg font-bold ${isLive ? "text-red-500" : ""}`}>
              {match.homeScore} - {match.awayScore}
            </div>
          ) : (
            {/* 예정 경기일 때 "vs" 텍스트도 CSS 변수(3차 텍스트 색)로 처리해요 */}
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>vs</div>
          )}
        </div>

        <Link href={`/team/${match.awayTeam.teamCode}`} className="flex-1 text-center hover:text-blue-600">
          <div className="font-medium text-xs">{match.awayTeam.nameKo}</div>
        </Link>
      </div>

      {match.venue && (
        <div className="text-[10px] text-slate-400 text-center mt-2">{match.venue}</div>
      )}
    </div>
  );
}
