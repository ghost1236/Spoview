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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Match } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  teamMatchesMap: Record<string, Match[]>;
  teams: { teamCode: string; nameKo: string; color: string }[];
}

export function PointsProgressChart({ teamMatchesMap, teams }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const datasets = teams.map(t => {
    const matches = (teamMatchesMap[t.teamCode] || [])
      .filter(m => m.status === "FINISHED")
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

    let cum = 0;
    const data = matches.map(m => {
      const isHome = m.homeTeam.teamCode === t.teamCode;
      const gf = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const ga = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      cum += gf > ga ? 3 : gf === ga ? 1 : 0;
      return cum;
    });

    return {
      label: t.nameKo,
      data,
      borderColor: t.color,
      backgroundColor: t.color + "15",
      borderWidth: 2.5,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: t.color,
      pointBorderColor: isDark ? "#1E293B" : "#fff",
      pointBorderWidth: 2,
      tension: 0.2,
      fill: true,
    };
  }).filter(d => d.data.length > 0);

  if (datasets.length === 0) return null;

  const maxLen = Math.max(...datasets.map(d => d.data.length));
  const labels = Array.from({ length: maxLen }, (_, i) => `${i + 1}`);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <Line
        data={{ labels, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              title: { display: true, text: "경기", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              ticks: {
                color: isDark ? "#64748B" : "#94A3B8",
                font: { size: 10 },
                maxTicksLimit: 15,
              },
              grid: { display: false },
              border: { color: isDark ? "#334155" : "#E2E8F0" },
            },
            y: {
              title: { display: true, text: "승점", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              beginAtZero: true,
              ticks: { color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              grid: { color: isDark ? "#1E293B" : "#F1F5F9" },
              border: { display: false },
            },
          },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                color: isDark ? "#CBD5E1" : "#475569",
                usePointStyle: true,
                pointStyle: "circle",
                padding: 16,
                font: { size: 12, weight: 600 },
              },
            },
            tooltip: {
              backgroundColor: isDark ? "#1E293B" : "#fff",
              titleColor: isDark ? "#F1F5F9" : "#0F172A",
              bodyColor: isDark ? "#CBD5E1" : "#475569",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}점`,
              },
            },
          },
        }}
      />
    </div>
  );
}
