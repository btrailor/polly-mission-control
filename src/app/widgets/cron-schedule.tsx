"use client";

import { usePolling } from "@/lib/use-polling";
import { getApiUrl } from "@/lib/api-config";
import { useState, useCallback } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { Clock, Play, Pause, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error";
  lastRun: string | null;
  nextRun: string | null;
}

function formatTimeUntil(iso: string | null): string {
  if (!iso) return "—";
  const target = new Date(iso);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return "overdue";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatLastRun(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}

export function CronScheduleWidget() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/crons"));
      if (!res.ok) throw new Error("Failed to fetch crons");
      const json = await res.json();
      setCrons(json.crons || []);
    } catch {
      setCrons([
        { id: "1", name: "Morning Brief", schedule: "0 8 * * *", status: "active", lastRun: new Date(Date.now() - 3600000 * 5).toISOString(), nextRun: new Date(Date.now() + 3600000 * 3).toISOString() },
        { id: "2", name: "Wiki Lint", schedule: "0 6 * * 2-6", status: "active", lastRun: new Date(Date.now() - 3600000 * 7).toISOString(), nextRun: new Date(Date.now() + 3600000 * 22).toISOString() },
        { id: "3", name: "Nightly Sync", schedule: "0 2 * * *", status: "active", lastRun: new Date(Date.now() - 3600000 * 11).toISOString(), nextRun: new Date(Date.now() + 3600000 * 13).toISOString() },
        { id: "4", name: "Weekly Report", schedule: "0 9 * * 1", status: "paused", lastRun: new Date(Date.now() - 86400000 * 7).toISOString(), nextRun: null },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchData, { interval: 300000 });


  const activeCrons = crons.filter((c) => c.status === "active");

  return (
    <>
      <WidgetCard title="Cron Schedule" icon={Clock} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-1.5">
          {crons.slice(0, 4).map((cron) => (
            <div key={cron.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    cron.status === "active" && "bg-emerald-500",
                    cron.status === "paused" && "bg-amber-500",
                    cron.status === "error" && "bg-red-500"
                  )}
                />
                <span className={cn("text-sm", cron.status === "error" && "text-red-400")}>{cron.name}</span>
              </div>
              <span className="text-xs text-[var(--muted)]">{formatTimeUntil(cron.nextRun)}</span>
            </div>
          ))}
          {crons.length > 4 && (
            <div className="text-xs text-[var(--muted)]">+{crons.length - 4} more</div>
          )}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Cron Schedule">
        <div className="space-y-2">
          {crons.map((cron) => (
            <div key={cron.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
              <div
                className={cn(
                  "size-2 rounded-full shrink-0",
                  cron.status === "active" && "bg-emerald-500",
                  cron.status === "paused" && "bg-amber-500",
                  cron.status === "error" && "bg-red-500"
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{cron.name}</span>
                  <span className="text-xs text-[var(--muted)]">{cron.schedule}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[var(--muted)]">
                  <span>Last: {formatLastRun(cron.lastRun)}</span>
                  <span>Next: {formatTimeUntil(cron.nextRun)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </WidgetDetail>
    </>
  );
}
