"use client";

import { useEffect, useMemo, useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayCost {
  date: string;
  cost: number;
}

interface ProviderBreakdown {
  provider: string;
  cost: number;
}

interface CostData {
  today: {
    totalTokens: number;
    estimatedCost: number;
    budget: number;
    percentage: number;
  };
  sparkline: DayCost[];
  breakdown: ProviderBreakdown[];
}

function BudgetBar({ percentage }: { percentage: number }) {
  const colorClass =
    percentage < 50
      ? "bg-emerald-500"
      : percentage <= 80
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--muted)]">Budget used</span>
        <span
          className={cn(
            "text-xs font-medium transition-colors duration-500",
            percentage < 50
              ? "text-emerald-400"
              : percentage <= 80
                ? "text-amber-400"
                : "text-red-400"
          )}
        >
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--sidebar-border)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", colorClass)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: DayCost[] }) {
  const svg = useMemo(() => {
    if (data.length === 0) return null;

    const width = 200;
    const height = 60;
    const padding = 2;

    const costs = data.map((d) => d.cost);
    const maxCost = Math.max(...costs, 0.01);
    const minCost = Math.min(...costs, 0);
    const range = maxCost - minCost || 1;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.cost - minCost) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const areaPath = `${points.map((p, i) => `${i === 0 ? "M" : "L"} ${p}`).join(" ")} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p}`).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[200px] h-[60px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparklineGradient)" />
        <path d={linePath} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (() => {
          const last = points[points.length - 1].split(",");
          return <circle cx={last[0]} cy={last[1]} r="2.5" fill="rgb(96, 165, 250)" stroke="rgb(15, 23, 42)" strokeWidth="1" />;
        })()}
      </svg>
    );
  }, [data]);

  return <div className="mt-2">{svg}</div>;
}

function Breakdown({ items }: { items: ProviderBreakdown[] }) {
  const maxCost = Math.max(...items.map((i) => i.cost), 0.01);

  return (
    <div className="mt-3 space-y-1.5">
      {items.map((item) => {
        const pct = (item.cost / maxCost) * 100;
        return (
          <div key={item.provider} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-[var(--muted)]">{item.provider}</span>
                <span className="text-xs font-medium">${item.cost.toFixed(2)}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[var(--sidebar-border)]">
                <div className="h-full rounded-full bg-blue-500/70 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DailyCostDetail({ data }: { data: CostData | null }) {
  if (!data) {
    return <div className="text-sm text-[var(--muted)] text-center py-12">No cost data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Today's Cost", value: `$${data.today.estimatedCost.toFixed(2)}` },
          { label: "Budget Used", value: `${data.today.percentage}%` },
          { label: "Total Tokens", value: data.today.totalTokens.toLocaleString() },
          { label: "Budget", value: `$${data.today.budget.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)] p-3">
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="text-lg font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {data.sparkline.length > 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)] p-4">
          <div className="text-xs font-medium mb-2">7-Day Trend</div>
          <Sparkline data={data.sparkline} />
        </div>
      )}

      {data.breakdown.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-3">Provider Breakdown</div>
          <Breakdown items={data.breakdown} />
        </div>
      )}
    </div>
  );
}

export function DailyCostWidget() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/costs")
      .then((r) => r.json())
      .then((d: CostData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const costDisplay = data ? `$${data.today.estimatedCost.toFixed(2)}` : "$—";
  const tokenDisplay = data ? `${data.today.totalTokens.toLocaleString()} tokens` : "—";

  return (
    <>
      <WidgetCard title="Daily Cost" icon={DollarSign} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold transition-all duration-500", loading && "opacity-50")}>
              {costDisplay}
            </span>
            {data && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded border",
                data.today.percentage < 50
                  ? "text-emerald-400 border-emerald-500/30"
                  : data.today.percentage <= 80
                    ? "text-amber-400 border-amber-500/30"
                    : "text-red-400 border-red-500/30"
              )}>
                {data.today.percentage}%
              </span>
            )}
          </div>

          <div className="text-xs text-[var(--muted)]">{tokenDisplay}</div>

          {data && <BudgetBar percentage={data.today.percentage} />}
          {data && data.sparkline.length > 0 && <Sparkline data={data.sparkline} />}
          {data && data.breakdown.length > 0 && <Breakdown items={data.breakdown} />}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Daily Cost — Detailed View">
        <DailyCostDetail data={data} />
      </WidgetDetail>
    </>
  );
}
