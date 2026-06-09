"use client";

import { useMemo, useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolling } from "@/lib/use-polling";
import { getApiUrl } from "@/lib/api-config";

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
        <span className="text-[10px] text-[var(--muted)]">Budget used</span>
        <span className="text-[10px] text-[var(--muted)]">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[var(--sidebar-bg)]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 0.01);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function DailyCostWidget() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/costs"));
      if (!res.ok) throw new Error("Failed to fetch costs");
      const json = await res.json();
      setData(json);
    } catch {
      // Demo data
      setData({
        today: {
          totalTokens: 45632,
          estimatedCost: 2.34,
          budget: 10.0,
          percentage: 23,
        },
        sparkline: [
          { date: "2026-06-02", cost: 1.2 },
          { date: "2026-06-03", cost: 1.5 },
          { date: "2026-06-04", cost: 0.8 },
          { date: "2026-06-05", cost: 1.9 },
          { date: "2026-06-06", cost: 2.1 },
          { date: "2026-06-07", cost: 1.7 },
          { date: "2026-06-08", cost: 2.34 },
        ],
        breakdown: [
          { provider: "Ollama", cost: 0.85 },
          { provider: "Groq", cost: 0.62 },
          { provider: "Google", cost: 0.43 },
          { provider: "OpenRouter", cost: 0.28 },
          { provider: "Copilot", cost: 0.16 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  usePolling(fetchData, { interval: 30000 });

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

          {data && (
            <Sparkline
              data={data.sparkline.map((d) => d.cost)}
              color="var(--accent)"
            />
          )}

          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {data.breakdown.slice(0, 4).map((item) => (
                <div key={item.provider} className="text-center p-1.5 rounded-md bg-[var(--sidebar-bg)]">
                  <div className="text-[10px] text-[var(--muted)]">{item.provider}</div>
                  <div className="text-sm font-medium">${item.cost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Daily Cost Breakdown">
        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Estimated Cost", value: `$${data.today.estimatedCost.toFixed(2)}`, color: "text-[var(--accent)]" },
                { label: "Total Tokens", value: data.today.totalTokens.toLocaleString(), color: "text-[var(--foreground)]" },
                { label: "Budget", value: `$${data.today.budget.toFixed(2)}`, color: "text-emerald-400" },
                { label: "Remaining", value: `$${(data.today.budget - data.today.estimatedCost).toFixed(2)}`, color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
                  <div className="text-[10px] text-[var(--muted)] mb-1">{stat.label}</div>
                  <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
              <div className="text-xs font-medium mb-3">7-Day Cost Trend</div>
              <Sparkline data={data.sparkline.map((d) => d.cost)} color="var(--accent)" />
              <div className="flex justify-between mt-2">
                {data.sparkline.map((d) => (
                  <div key={d.date} className="text-center">
                    <div className="text-[10px] text-[var(--muted)]">{d.date.slice(5)}</div>
                    <div className="text-xs">${d.cost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">Provider Breakdown</div>
              {data.breakdown.map((item) => {
                const pct = (item.cost / data.today.estimatedCost) * 100;
                return (
                  <div key={item.provider} className="flex items-center justify-between p-2 rounded-md bg-[var(--sidebar-bg)]">
                    <span className="text-sm">{item.provider}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-[var(--card-bg)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">${item.cost.toFixed(2)}</span>
                      <span className="text-xs text-[var(--muted)] w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </WidgetDetail>
    </>
  );
}
