"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Match } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  matches: Match[];
  teamCode: string;
}

export function SeasonLineChart({ matches, teamCode }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  if (finished.length < 3) return null;

  let cumScored = 0;
  let cumConceded = 0;
  const labels: string[] = [];
  const scoredData: number[] = [];
  const concededData: number[] = [];

  finished.forEach((m, i) => {
    const isHome = m.homeTeam.teamCode === teamCode;
    cumScored += (isHome ? m.homeScore : m.awayScore) ?? 0;
    cumConceded += (isHome ? m.awayScore : m.homeScore) ?? 0;
    labels.push(`${i + 1}`);
    scoredData.push(cumScored);
    concededData.push(cumConceded);
  });

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">시즌 누적 득/실점</h3>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "득점",
              data: scoredData,
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.3,
            },
            {
              label: "실점",
              data: concededData,
              borderColor: "rgba(239, 68, 68, 1)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: "경기", color: isDark ? "#9CA3AF" : "#6B7280" },
              ticks: { color: isDark ? "#9CA3AF" : "#6B7280" },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { color: isDark ? "#9CA3AF" : "#6B7280" },
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
