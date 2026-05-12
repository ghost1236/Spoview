"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "next-themes";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TeamRecord {
  name: string;
  won: number;
  drawn: number;
  lost: number;
  isFootball: boolean;
}

interface Props {
  teams: TeamRecord[];
}

export function WinLossDonutChart({ teams }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (teams.length === 0) return null;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`, gap: 16 }} className="wld-grid">
        {teams.map(t => {
          const total = t.won + t.drawn + t.lost;
          if (total === 0) return null;
          const winPct = Math.round((t.won / total) * 100);

          const labels = t.isFootball ? ["승", "무", "패"] : ["승", "패"];
          const data = t.isFootball ? [t.won, t.drawn, t.lost] : [t.won, t.lost];
          const colors = t.isFootball
            ? ["#16A34A", "#94A3B8", "#DC2626"]
            : ["#16A34A", "#DC2626"];

          return (
            <div key={t.name} style={{ textAlign: "center" }}>
              <div style={{ maxWidth: 120, margin: "0 auto" }}>
                <Doughnut
                  data={{
                    labels,
                    datasets: [{
                      data,
                      backgroundColor: colors,
                      borderWidth: 0,
                      hoverOffset: 4,
                    }],
                  }}
                  options={{
                    responsive: true,
                    cutout: "65%",
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDark ? "#1E293B" : "#fff",
                        titleColor: isDark ? "#F1F5F9" : "#0F172A",
                        bodyColor: isDark ? "#CBD5E1" : "#475569",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                        borderWidth: 1,
                        padding: 8,
                        cornerRadius: 6,
                        callbacks: {
                          label: (ctx) => `${ctx.label}: ${ctx.parsed}경기`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                승률 {winPct}% · {t.isFootball ? `${t.won}승 ${t.drawn}무 ${t.lost}패` : `${t.won}승 ${t.lost}패`}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-tertiary)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#16A34A", display: "inline-block" }} />승
        </span>
        {teams.some(t => t.isFootball) && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-tertiary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#94A3B8", display: "inline-block" }} />무
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-tertiary)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#DC2626", display: "inline-block" }} />패
        </span>
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .wld-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
