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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendTeam {
  values: number[];
  color: string;
  name: string;
}

interface Props {
  data: Record<string, TrendTeam>;
  yLabel?: string;
}

export function TrendLineChart({ data, yLabel = "누적 득실" }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const maxLen = Math.max(...entries.map(([, d]) => d.values.length));
  const labels = Array.from({ length: maxLen }, (_, i) => `${i + 1}`);

  const datasets = entries.map(([code, d]) => ({
    label: d.name,
    data: d.values,
    borderColor: d.color,
    backgroundColor: d.color + "20",
    borderWidth: 2.5,
    pointRadius: 3,
    pointHoverRadius: 6,
    pointBackgroundColor: d.color,
    pointBorderColor: isDark ? "#1E293B" : "#fff",
    pointBorderWidth: 2,
    tension: 0.3,
    fill: false,
  }));

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <Line
        data={{ labels, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            x: {
              title: { display: true, text: "경기", color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              ticks: { color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
              grid: { display: false },
              border: { color: isDark ? "#334155" : "#E2E8F0" },
            },
            y: {
              title: { display: true, text: yLabel, color: isDark ? "#64748B" : "#94A3B8", font: { size: 11 } },
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
              displayColors: true,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0) >= 0 ? "+" : ""}${ctx.parsed.y ?? 0}`,
              },
            },
          },
        }}
      />
    </div>
  );
}
