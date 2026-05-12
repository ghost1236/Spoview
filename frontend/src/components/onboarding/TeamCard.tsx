"use client";

import type { Team } from "@/lib/api";
import { TeamLogo } from "@/components/common/TeamLogo";

interface Props {
  team: Team;
  isSelected: boolean;
  onToggle: (team: Team) => void;
}

export function TeamCard({ team, isSelected, onToggle }: Props) {
  return (
    <button
      onClick={() => onToggle(team)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition hover:shadow-md ${
        isSelected
          ? "border-[var(--brand-primary)] bg-[color-mix(in_srgb,var(--brand-primary)_4%,var(--surface))]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <TeamLogo teamCode={team.teamCode} name={team.nameKo} size={48} />
      <span className="text-sm font-medium text-center leading-tight">{team.nameKo}</span>
      {isSelected && (
        <span style={{ fontSize: 11, color: "var(--brand-primary)", fontWeight: 700 }}>선택됨</span>
      )}
    </button>
  );
}
