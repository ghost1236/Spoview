"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { Standing } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  standing: Standing;
}

export function DonutChart({ standing }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isFootball = standing.points > 0;

  // 축구: 승/무/패 비율, 야구: 승/패 비율
  const labels = isFootball ? ["승", "무", "패"] : ["승", "패"];
  const data = isFootball
    ? [standing.won, standing.drawn, standing.lost]
    : [standing.won, standing.lost];
  const colors = isFootball
    ? ["rgba(34,197,94,0.8)", "rgba(156,163,175,0.8)", "rgba(239,68,68,0.8)"]
    : ["rgba(34,197,94,0.8)", "rgba(239,68,68,0.8)"];

  if (standing.played === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">승/무/패 비율</h3>
      <div className="max-w-[200px] mx-auto">
        <Doughnut
          data={{
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderWidth: 0,
            }],
          }}
          options={{
            responsive: true,
            cutout: "60%",
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: isDark ? "#D1D5DB" : "#374151", padding: 12 },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
