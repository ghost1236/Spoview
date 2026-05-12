"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Standing } from "@/lib/api";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  standings: Standing[];
  teamCode: string;
}

export function TeamRadarChart({ standings, teamCode }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const team = standings.find((s) => s.team.teamCode === teamCode);
  if (!team || standings.length === 0) return null;

  const totalTeams = standings.length;
  const rankPct = ((totalTeams - team.rank + 1) / totalTeams) * 100;
  const winPct = team.played > 0 ? (team.won / team.played) * 100 : 0;
  const scorePct = Math.min(100, (team.goalsFor / Math.max(1, standings[0]?.goalsFor || 1)) * 100);
  const defPct = team.played > 0 ? Math.max(0, 100 - (team.goalsAgainst / team.played) * 20) : 0;
  const formPct = team.form
    ? (team.form.split("").filter((c) => c === "W").length / team.form.length) * 100
    : 50;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">리그 내 포지션</h3>
      <Radar
        data={{
          labels: ["순위", "승률", "공격력", "수비력", "최근 폼"],
          datasets: [
            {
              label: team.team.nameKo,
              data: [rankPct, winPct, scorePct, defPct, formPct],
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderColor: "rgba(59, 130, 246, 0.8)",
              pointBackgroundColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: { display: false },
              grid: { color: isDark ? "#374151" : "#E5E7EB" },
              pointLabels: { color: isDark ? "#9CA3AF" : "#6B7280", font: { size: 11 } },
            },
          },
          plugins: {
            legend: { display: false },
          },
        }}
      />
    </div>
  );
}
