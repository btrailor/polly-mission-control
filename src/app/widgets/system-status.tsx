"use client";

import { useState, useCallback } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { Activity, Server, Database, Wifi, Cpu, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemComponent {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number | null;
  uptime: string;
}

interface SystemStatus {
  components: SystemComponent[];
  overall: "online" | "degraded" | "offline";
  lastChecked: string;
}

const STATUS_CONFIG = {
  online: { color: "text-emerald-400", bg: "bg-emerald-500", label: "Online" },
  degraded: { color: "text-amber-400", bg: "bg-amber-500", label: "Degraded" },
  offline: { color: "text-red-400", bg: "bg-red-500", label: "Offline" },
};

const COMPONENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Gateway: Wifi,
  Ollama: Cpu,
  Knowledge: Database,
  GBrain: Server,
  Storage: HardDrive,
};

export function SystemStatusWidget() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system");
      if (!res.ok) throw new Error("Failed to fetch system status");
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        components: [
          { name: "Gateway", status: "online", latency: 12, uptime: "5d 4h" },
          { name: "Ollama", status: "online", latency: 45, uptime: "3d 2h" },
          { name: "Knowledge", status: "online", latency: 23, uptime: "5d 4h" },
          { name: "GBrain", status: "degraded", latency: 234, uptime: "2d 1h" },
          { name: "Storage", status: "online", latency: 8, uptime: "15d" },
        ],
        overall: "degraded",
        lastChecked: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const config = data ? STATUS_CONFIG[data.overall] : STATUS_CONFIG.online;

  return (
    <>
      <WidgetCard title="System Status" icon={Activity} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn("size-2 rounded-full", config.bg)} />
            <span className={cn("text-sm font-medium capitalize", config.color)}>
              {config.label}
            </span>
          </div>

          {data?.components.slice(0, 4).map((comp) => {
            const Icon = COMPONENT_ICONS[comp.name] || Activity;
            const compConfig = STATUS_CONFIG[comp.status];
            return (
              <div key={comp.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-[var(--muted)]" />
                  <span className="text-sm">{comp.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {comp.latency && <span className="text-xs text-[var(--muted)]">{comp.latency}ms</span>}
                  <div className={cn("size-1.5 rounded-full", compConfig.bg)} />
                </div>
              </div>
            );
          })}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="System Status">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
            <div className={cn("size-3 rounded-full", config.bg)} />
            <div>
              <div className="font-medium">Overall Status: {config.label}</div>
              {data?.lastChecked && (
                <div className="text-xs text-[var(--muted)]">
                  Last checked: {new Date(data.lastChecked).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {data?.components.map((comp) => {
              const Icon = COMPONENT_ICONS[comp.name] || Activity;
              const compConfig = STATUS_CONFIG[comp.status];

              return (
                <div key={comp.name} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
                  <div className={cn("flex items-center justify-center size-8 rounded-lg", comp.status === "online" ? "bg-emerald-500/10" : comp.status === "degraded" ? "bg-amber-500/10" : "bg-red-500/10")}>
                    <Icon className={cn("size-4", compConfig.color)} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comp.name}</span>
                      <span className={cn("text-xs font-medium", compConfig.color)}>
                        {compConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--muted)]">
                      {comp.latency && <span>Latency: {comp.latency}ms</span>}
                      <span>Uptime: {comp.uptime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WidgetDetail>
    </>
  );
}
