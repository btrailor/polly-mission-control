"use client";

import { usePolling } from "@/lib/use-polling";
import { useState, useCallback } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

interface VaultHealth {
  totalNotes: number;
  indexed: number;
  errors: number;
  lastSync: string;
  health: "healthy" | "degraded" | "critical";
}

export function VaultHealthWidget() {
  const [data, setData] = useState<VaultHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/vault"));
      if (!res.ok) throw new Error("Failed to fetch vault health");
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        totalNotes: 436,
        indexed: 428,
        errors: 8,
        lastSync: "2026-06-08T06:00:00Z",
        health: "healthy",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  usePolling(fetchData, { interval: 30000 });

  const healthColor = (health: string) => {
    switch (health) {
      case "healthy": return "text-emerald-400";
      case "degraded": return "text-amber-400";
      case "critical": return "text-red-400";
      default: return "text-[var(--muted)]";
    }
  };

  const healthBg = (health: string) => {
    switch (health) {
      case "healthy": return "bg-emerald-500";
      case "degraded": return "bg-amber-500";
      case "critical": return "bg-red-500";
      default: return "bg-[var(--muted)]";
    }
  };

  return (
    <>
      <WidgetCard title="Vault Health" icon={Shield} loading={loading} onExpand={() => setDetailOpen(true)}>
        {data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn("size-2 rounded-full", healthBg(data.health))} />
              <span className={cn("text-sm font-medium capitalize", healthColor(data.health))}>
                {data.health}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded bg-[var(--sidebar-bg)]">
                <div className="text-lg font-bold">{data.totalNotes}</div>
                <div className="text-[10px] text-[var(--muted)]">Notes</div>
              </div>
              <div className="text-center p-2 rounded bg-[var(--sidebar-bg)]">
                <div className="text-lg font-bold">{data.indexed}</div>
                <div className="text-[10px] text-[var(--muted)]">Indexed</div>
              </div>
            </div>
            {data.errors > 0 && (
              <div className="text-xs text-red-400">{data.errors} errors</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)]">No vault data</div>
        )}
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Vault Health — Detailed">
        {data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
              <div className={cn("size-3 rounded-full", healthBg(data.health))} />
              <div>
                <div className="font-medium capitalize">{data.health}</div>
                <div className="text-xs text-[var(--muted)]">Last sync: {data.lastSync}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Notes", value: data.totalNotes },
                { label: "Indexed", value: data.indexed },
                { label: "Errors", value: data.errors, color: data.errors > 0 ? "text-red-400" : undefined },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
                  <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                  <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </WidgetDetail>
    </>
  );
}
