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
  teamMatchesMap: Record<string, Match[]>;
  teams: { teamCode: string; nameKo: string }[];
}

export function HeadToHeadChart({ teamMatchesMap, teams }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (teams.length < 2) return null;

  const teamCodes = new Set(teams.map(t => t.teamCode));
  const nameMap: Record<string, string> = {};
  teams.forEach(t => { nameMap[t.teamCode] = t.nameKo; });

  // Find all matches between subscribed teams
  const pairs: Record<string, { W: number; L: number; label: string }> = {};

  teams.forEach(t => {
    const matches = (teamMatchesMap[t.teamCode] || []).filter(m => m.status === "FINISHED");
    matches.forEach(m => {
      const opCode = m.homeTeam.teamCode === t.teamCode ? m.awayTeam.teamCode : m.homeTeam.teamCode;
      if (!teamCodes.has(opCode)) return;

      // Create unique pair key (sorted to avoid duplicates)
      const sorted = [t.teamCode, opCode].sort();
      const pairKey = sorted.join("-");
      if (pairs[pairKey]) return; // Already processed this pair from other side

      // Compute head-to-head from team t's perspective (first sorted team)
      const firstTeam = sorted[0];
      const allMatches = (teamMatchesMap[firstTeam] || [])
        .filter(m2 => m2.status === "FINISHED" &&
          (m2.homeTeam.teamCode === opCode || m2.awayTeam.teamCode === opCode) &&
          (m2.homeTeam.teamCode === firstTeam || m2.awayTeam.teamCode === firstTeam));

      let w = 0, l = 0;
      allMatches.forEach(m2 => {
        const isHome = m2.homeTeam.teamCode === firstTeam;
        const gf = isHome ? (m2.homeScore ?? 0) : (m2.awayScore ?? 0);
        const ga = isHome ? (m2.awayScore ?? 0) : (m2.homeScore ?? 0);
        if (gf > ga) w++;
        else if (gf < ga) l++;
      });

      pairs[pairKey] = {
        W: w,
        L: l,
        label: `${nameMap[sorted[0]]} vs ${nameMap[sorted[1]]}`,
      };
    });
  });

  const pairEntries = Object.values(pairs);
  if (pairEntries.length === 0) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, textAlign: "center", padding: 30, color: "var(--text-tertiary)", fontSize: 13 }}>
        팀간 상대 전적 데이터 없음
      </div>
    );
  }

  const labels = pairEntries.map(p => p.label);
  const wins = pairEntries.map(p => p.W);
  const losses = pairEntries.map(p => p.L);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "승",
              data: wins,
              backgroundColor: "#16A34A",
              borderRadius: 4,
              barPercentage: 0.6,
            },
            {
              label: "패",
              data: losses,
              backgroundColor: "#DC2626",
              borderRadius: 4,
              barPercentage: 0.6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          scales: {
            x: {
              ticks: { color: isDark ? "#CBD5E1" : "#475569", font: { size: 11, weight: "600" } },
              grid: { display: false },
              border: { color: isDark ? "#334155" : "#E2E8F0" },
            },
            y: {
              beginAtZero: true,
              ticks: { color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 }, stepSize: 1 },
              grid: { color: isDark ? "#1E293B" : "#F1F5F9" },
              border: { display: false },
              title: { display: true, text: "경기 수", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
            },
          },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                color: isDark ? "#CBD5E1" : "#475569",
                usePointStyle: true,
                pointStyle: "rectRounded",
                padding: 16,
                font: { size: 12, weight: "600" },
              },
            },
            tooltip: {
              backgroundColor: isDark ? "#1E293B" : "#fff",
              titleColor: isDark ? "#F1F5F9" : "#0F172A",
              bodyColor: isDark ? "#CBD5E1" : "#475569",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
            },
          },
        }}
      />
    </div>
  );
}
