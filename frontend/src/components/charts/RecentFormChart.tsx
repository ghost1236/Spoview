"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Match } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  matches: Match[];
  teamCode: string;
}

export function RecentFormChart({ matches, teamCode }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const recentFinished = matches
    .filter((m) => m.status === "FINISHED")
    .slice(-6);

  if (recentFinished.length === 0) return null;

  const labels = recentFinished.map((m) => {
    const opponent =
      m.homeTeam.teamCode === teamCode ? m.awayTeam.nameKo : m.homeTeam.nameKo;
    return opponent.length > 4 ? opponent.slice(0, 4) + ".." : opponent;
  });

  const scored = recentFinished.map((m) =>
    m.homeTeam.teamCode === teamCode ? m.homeScore ?? 0 : m.awayScore ?? 0
  );
  const conceded = recentFinished.map((m) =>
    m.homeTeam.teamCode === teamCode ? m.awayScore ?? 0 : m.homeScore ?? 0
  );

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">최근 6경기 득/실점</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "득점",
              data: scored,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
            },
            {
              label: "실점",
              data: conceded,
              backgroundColor: "rgba(239, 68, 68, 0.7)",
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            x: { ticks: { color: isDark ? "#9CA3AF" : "#6B7280" }, grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { color: isDark ? "#9CA3AF" : "#6B7280", stepSize: 1 },
              grid: { color: isDark ? "#374151" : "#E5E7EB" },
            },
          },
          plugins: {
            legend: { labels: { color: isDark ? "#D1D5DB" : "#374151" } },
          },
        }}
      />
    </div>
  );
}
