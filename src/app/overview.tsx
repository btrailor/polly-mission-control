"use client";

import { WidgetCard } from "./widget-card";
import { cn } from "@/lib/utils";
import { DailyCostWidget } from "./widgets/daily-cost";
import { RoutineChecklistWidget } from "./widgets/routine-checklist";
import { CalendarWidget } from "./widgets/calendar-widget";
import { AgentStatusGrid } from "./widgets/agent-status-grid";
import { LiveMessageFeedWidget } from "./widgets/live-message-feed";
import { ProjectKanbanWidget } from "./widgets/project-kanban";
import { VaultHealthWidget } from "./widgets/vault-health";
import {
  Activity,
  Users,
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckSquare,
  DollarSign,
} from "lucide-react";

export function Overview() {
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Your personal and agent operations at a glance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active Agents", value: "65", icon: Users, color: "text-blue-400" },
          { label: "Tasks Today", value: "12/24", icon: CheckSquare, color: "text-emerald-400" },
          { label: "Daily Cost", value: "$2.34", icon: DollarSign, color: "text-amber-400" },
          { label: "Alerts", value: "3", icon: AlertTriangle, color: "text-red-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("size-4", stat.color)} />
              <span className="text-xs text-[var(--muted)]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <DailyCostWidget />

        <RoutineChecklistWidget />

        <CalendarWidget />

        <AgentStatusGrid />

        <LiveMessageFeedWidget />

        <ProjectKanbanWidget />

        <VaultHealthWidget />

        <WidgetCard title="Cron Schedule" icon={Clock} onExpand={() => {}}>
          <div className="space-y-1.5">
            {[
              { name: "Morning Brief", time: "8:00 AM", next: "2h" },
              { name: "Wiki Lint", time: "6:00 AM", next: "Done" },
              { name: "Nightly Sync", time: "2:00 AM", next: "12h" },
            ].map((cron) => (
              <div key={cron.name} className="flex items-center justify-between">
                <span className="text-sm">{cron.name}</span>
                <span className="text-xs text-[var(--muted)]">{cron.next}</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Quick Actions" icon={Activity} onExpand={() => {}}>
          <div className="grid grid-cols-2 gap-2">
            {["New Task", "Run Agent", "Sync Vault", "Export"].map((action) => (
              <button
                key={action}
                className="text-xs py-2 px-3 rounded-md border border-[var(--card-border)] bg-[var(--sidebar-bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="System Status" icon={AlertTriangle} onExpand={() => {}}>
          <div className="space-y-2">
            {[
              { label: "Gateway", status: "Online", color: "text-emerald-400" },
              { label: "Ollama", status: "Online", color: "text-emerald-400" },
              { label: "Knowledge", status: "Online", color: "text-emerald-400" },
              { label: "GBrain", status: "Degraded", color: "text-amber-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <span className={cn("text-xs", item.color)}>{item.status}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
