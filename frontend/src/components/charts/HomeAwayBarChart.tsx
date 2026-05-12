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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SplitData {
  home: { W: number; D: number; L: number };
  away: { W: number; D: number; L: number };
  name: string;
}

interface Props {
  data: Record<string, SplitData>;
}

export function HomeAwayBarChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const labels: string[] = [];
  const homeWin: number[] = [];
  const homeDraw: number[] = [];
  const homeLoss: number[] = [];
  const awayWin: number[] = [];
  const awayDraw: number[] = [];
  const awayLoss: number[] = [];

  entries.forEach(([, s]) => {
    labels.push(s.name);
    homeWin.push(s.home.W);
    homeDraw.push(s.home.D);
    homeLoss.push(s.home.L);
    awayWin.push(s.away.W);
    awayDraw.push(s.away.D);
    awayLoss.push(s.away.L);
  });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <Bar
        data={{
          labels,
          datasets: [
            { label: "홈 승", data: homeWin, backgroundColor: "#16A34A", stack: "home", borderRadius: 3 },
            { label: "홈 무", data: homeDraw, backgroundColor: "#94A3B8", stack: "home", borderRadius: 3 },
            { label: "홈 패", data: homeLoss, backgroundColor: "#DC2626", stack: "home", borderRadius: 3 },
            { label: "원정 승", data: awayWin, backgroundColor: "#16A34A99", stack: "away", borderRadius: 3 },
            { label: "원정 무", data: awayDraw, backgroundColor: "#94A3B899", stack: "away", borderRadius: 3 },
            { label: "원정 패", data: awayLoss, backgroundColor: "#DC262699", stack: "away", borderRadius: 3 },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          indexAxis: "y",
          scales: {
            x: {
              stacked: true,
              ticks: { color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 }, stepSize: 1 },
              grid: { color: isDark ? "#1E293B" : "#F1F5F9" },
              border: { display: false },
              title: { display: true, text: "경기 수", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
            },
            y: {
              stacked: true,
              ticks: { color: isDark ? "#CBD5E1" : "#475569", font: { size: 12, weight: "600" } },
              grid: { display: false },
              border: { color: isDark ? "#334155" : "#E2E8F0" },
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: isDark ? "#CBD5E1" : "#475569",
                usePointStyle: true,
                pointStyle: "rectRounded",
                padding: 12,
                font: { size: 11 },
                filter: (item) => {
                  // Only show one set of win/draw/loss labels
                  return item.datasetIndex !== undefined && item.datasetIndex < 3;
                },
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
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8, fontSize: 11, color: isDark ? "#94A3B8" : "#64748B" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#16A34A", display: "inline-block" }} />홈
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#16A34A99", display: "inline-block" }} />원정
        </span>
      </div>
    </div>
  );
}
