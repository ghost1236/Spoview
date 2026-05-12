"use client";

import { LEAGUE_TABS } from "@/lib/constants";

interface Props {
  selected: string | null;
  onChange: (code: string | null) => void;
}

export function LeagueTabFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {LEAGUE_TABS.map((tab) => {
        // 현재 선택된 탭인지 확인해요
        const isSelected = selected === tab.code;

        return (
          <button
            key={tab.code ?? "all"}
            onClick={() => onChange(tab.code)}
            // 선택된 탭은 파란색 고정, 비선택 탭은 CSS 변수로 라이트/다크 자동 전환해요
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border"
            style={
              isSelected
                ? {
                    background: "#2563eb",    // 선택 탭: 파란색 고정
                    color: "#ffffff",
                    borderColor: "#2563eb",
                  }
                : {
                    background: "var(--surface-2)",          // 비선택 탭: 테마에 맞는 배경
                    color: "var(--text-secondary)",          // 비선택 탭: 테마에 맞는 텍스트
                    borderColor: "var(--border)",            // 비선택 탭: 테마에 맞는 테두리
                  }
            }
            // hover 효과: 마우스가 올라오면 surface 배경으로 살짝 밝아져요
            onMouseEnter={e => {
              if (!isSelected) e.currentTarget.style.background = "var(--surface)";
            }}
            onMouseLeave={e => {
              if (!isSelected) e.currentTarget.style.background = "var(--surface-2)";
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
