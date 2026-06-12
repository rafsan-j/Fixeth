"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import type { DashboardAnalytics } from "@/types/ui";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  dashboardAnalytics: DashboardAnalytics | null;
  T: Record<string, string>;
  t: Record<string, string>;
  lang: string;
}

export default function DashboardCharts({ dashboardAnalytics, T, t, lang }: DashboardChartsProps) {
  const dailySeries = dashboardAnalytics?.dailyCompletions ?? [];
  const moduleSeries = (dashboardAnalytics?.moduleCompletions ?? []).filter(
    (m) => m.totalLessons > 0
  );

  const trendLabels = dailySeries.map((point) =>
    new Date(`${point.date}T00:00:00`).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      { month: "short", day: "numeric" }
    )
  );
  const trendValues = dailySeries.map((point) => point.completedLessons);
  const trendMax = Math.max(1, ...trendValues);
  const totalCompletionsInRange = trendValues.reduce((sum, v) => sum + v, 0);

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: t.lessonsCompleted,
        data: trendValues,
        borderColor: T.accent,
        backgroundColor: `${T.accent}22`,
        fill: true,
        tension: 0.35,
        pointRadius: 2.5,
        pointHoverRadius: 4,
        pointBackgroundColor: T.accent,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: `${T.border}55` },
        ticks: { color: T.txt2, maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: true,
        suggestedMax: trendMax,
        grid: { color: `${T.border}55` },
        ticks: { color: T.txt2, precision: 0 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: T.bg2,
        titleColor: T.txt0,
        bodyColor: T.txt1,
        borderColor: T.border,
        borderWidth: 1,
      },
    },
  };

  const moduleChartData = {
    labels: moduleSeries.map((m) => m.moduleTitle),
    datasets: [
      {
        data: moduleSeries.map((m) => m.completedLessons),
        backgroundColor: [T.accent, T.blue, T.amber, "#FF5B8A", "#9E6BFF", "#53D0A0"],
        borderColor: T.bg1,
        borderWidth: 2,
      },
    ],
  };

  const moduleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: T.txt1,
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
          font: { size: 10 },
        },
      },
      tooltip: {
        backgroundColor: T.bg2,
        titleColor: T.txt0,
        bodyColor: T.txt1,
        borderColor: T.border,
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<"doughnut">) => {
            const item = moduleSeries[context.dataIndex];
            if (!item) return context.label ?? "";
            return `${context.label}: ${String(context.raw)}/${item.totalLessons}`;
          },
        },
      },
    },
  };

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
      <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="m-0 text-[13.5px] font-extrabold text-[var(--t-txt0)]">
            {t.learningTrend}
          </h3>
          <span className="text-[10px] text-[var(--t-txt1)]">{t.activityLastDays}</span>
        </div>
        <div className="h-[180px] md:h-[220px]">
          <Line data={trendChartData} options={trendChartOptions} />
        </div>
      </div>

      <div className="hidden rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)] md:block">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="m-0 text-[13.5px] font-extrabold text-[var(--t-txt0)]">
            {t.moduleDistribution}
          </h3>
          <span className="text-[10px] font-bold text-[var(--t-accent)]">
            {totalCompletionsInRange}
          </span>
        </div>
        <div className="h-[220px]">
          {moduleSeries.length > 0 ? (
            <Doughnut data={moduleChartData} options={moduleChartOptions} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--t-txt2)]">
              {t.noActivityYet}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
