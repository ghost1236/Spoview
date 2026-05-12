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
import type { Match, Standing } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  teamMatchesMap: Record<string, Match[]>;
  standingsMap: Record<string, Standing[]>;
  teams: { teamCode: string; nameKo: string; leagueCode: string; color: string }[];
}

export function RankTrendChart({ teamMatchesMap, standingsMap, teams }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const datasets = teams.map(t => {
    const matches = (teamMatchesMap[t.teamCode] || [])
      .filter(m => m.status === "FINISHED")
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

    if (matches.length === 0) return null;

    const standings = standingsMap[t.leagueCode] || [];
    const isFootball = standings.length > 0 && standings[0].points > 0;

    // Compute cumulative points/wins after each match
    let cumPoints = 0;
    let cumWins = 0;
    const rankData = matches.map(m => {
      const isHome = m.homeTeam.teamCode === t.teamCode;
      const gf = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const ga = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

      if (gf > ga) { cumPoints += 3; cumWins++; }
      else if (gf === ga) { cumPoints += 1; }

      // Estimate rank: count teams with more points/wins in current standings
      let betterTeams = 0;
      if (isFootball) {
        // For football: compare points proportionally (normalize to same number of games)
        const myPPG = cumPoints / (matches.indexOf(m) + 1); // points per game so far
        standings.forEach(s => {
          if (s.team.teamCode === t.teamCode) return;
          const sPPG = s.played > 0 ? s.points / s.played : 0;
          if (sPPG > myPPG) betterTeams++;
        });
      } else {
        // For baseball: compare win rate
        const played = matches.indexOf(m) + 1;
        const myWinPct = cumWins / played;
        standings.forEach(s => {
          if (s.team.teamCode === t.teamCode) return;
          const sWinPct = s.played > 0 ? s.won / s.played : 0;
          if (sWinPct > myWinPct) betterTeams++;
        });
      }

      return betterTeams + 1; // rank = 1 + teams above
    });

    return {
      label: t.nameKo,
      data: rankData,
      borderColor: t.color,
      backgroundColor: t.color + "20",
      borderWidth: 2.5,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: t.color,
      pointBorderColor: isDark ? "#1E293B" : "#fff",
      pointBorderWidth: 2,
      tension: 0.3,
      fill: false,
    };
  }).filter(Boolean);

  if (datasets.length === 0) return null;

  const maxLen = Math.max(...datasets.map((d: any) => d.data.length));
  const labels = Array.from({ length: maxLen }, (_, i) => `${i + 1}`);
  const maxRank = Math.max(...datasets.flatMap((d: any) => d.data), 5);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <Line
        data={{ labels, datasets: datasets as any }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          layout: { padding: { top: 10 } },
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              title: { display: true, text: "경기", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              ticks: { color: isDark ? "#64748B" : "#94A3B8", font: { size: 10 }, maxTicksLimit: 15 },
              grid: { display: false },
              border: { color: isDark ? "#334155" : "#E2E8F0" },
            },
            y: {
              title: { display: true, text: "순위", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              reverse: true, // 1위가 위로
              min: 0,
              max: maxRank + 2,
              ticks: {
                color: isDark ? "#64748B" : "#94A3B8",
                font: { size: 11 },
                stepSize: 1,
                callback: (val: any) => `${val}위`,
              },
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
                title: (items) => `${items[0].label}경기 후`,
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}위`,
              },
            },
          },
        }}
      />
    </div>
  );
}
