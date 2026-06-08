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

export function Overview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Your personal and agent operations at a glance.</p>
      </div>

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
