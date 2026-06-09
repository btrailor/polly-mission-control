"use client";

import { useState, useEffect } from "react";
import { WidgetCard } from "./widget-card";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";
import { DailyCostWidget } from "./widgets/daily-cost";
import { RoutineChecklistWidget } from "./widgets/routine-checklist";
import { CalendarWidget } from "./widgets/calendar-widget";
import { AgentStatusGrid } from "./widgets/agent-status-grid";
import { LiveMessageFeedWidget } from "./widgets/live-message-feed";
import { ProjectKanbanWidget } from "./widgets/project-kanban";
import { VaultHealthWidget } from "./widgets/vault-health";
import { CronScheduleWidget } from "./widgets/cron-schedule";
import { QuickActionsWidget } from "./widgets/quick-actions";
import { SystemStatusWidget } from "./widgets/system-status";
import { AttentionQueueWidget } from "./widgets/attention-queue";
import {
  Users,
  CheckSquare,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

interface StatsData {
  activeAgents: number;
  totalAgents: number;
  tasksDone: number;
  tasksTotal: number;
  dailyCost: number;
  alerts: number;
}

function useStats() {
  const [stats, setStats] = useState<StatsData>({
    activeAgents: 0,
    totalAgents: 0,
    tasksDone: 0,
    tasksTotal: 0,
    dailyCost: 0,
    alerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agentsRes, costsRes, attentionRes] = await Promise.all([
          fetch(getApiUrl("/api/agents")),
          fetch(getApiUrl("/api/costs")),
          fetch(getApiUrl("/api/attention")),
        ]);

        const agents = agentsRes.ok ? await agentsRes.json() : { agents: [] };
        const costs = costsRes.ok ? await costsRes.json() : { today: { estimatedCost: 0 } };
        const attention = attentionRes.ok ? await attentionRes.json() : { items: [] };

        const activeAgents = agents.agents?.filter((a: any) => a.status === "running").length || 0;
        const totalAgents = agents.agents?.length || 0;

        setStats({
          activeAgents,
          totalAgents,
          tasksDone: 0, // TODO: derive from tasks endpoint
          tasksTotal: 0,
          dailyCost: costs.today?.estimatedCost || 0,
          alerts: attention.items?.length || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}

export function Overview() {
  const { stats, loading } = useStats();

  const statItems = [
    { label: "Active Agents", value: loading ? "—" : `${stats.activeAgents}/${stats.totalAgents}`, icon: Users, color: "text-blue-400" },
    { label: "Tasks Today", value: loading ? "—" : `${stats.tasksDone}/${stats.tasksTotal || "—"}`, icon: CheckSquare, color: "text-emerald-400" },
    { label: "Daily Cost", value: loading ? "—" : `$${stats.dailyCost.toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
    { label: "Alerts", value: loading ? "—" : String(stats.alerts), icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Your personal and agent operations at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("size-4", stat.color)} />
              <span className="text-xs text-[var(--muted)]">{stat.label}</span>
            </div>
            <div className={cn("text-2xl font-bold", loading && "opacity-50")}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <DailyCostWidget />
        <RoutineChecklistWidget />
        <CalendarWidget />
        <AgentStatusGrid />
        <LiveMessageFeedWidget />
        <ProjectKanbanWidget />
        <VaultHealthWidget />
        <CronScheduleWidget />
        <QuickActionsWidget />
        <SystemStatusWidget />
        <AttentionQueueWidget />
      </div>
    </div>
  );
}
