"use client";

import { useState } from "react";
import { Activity, GitCommit, MessageSquare, Rocket, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "deploy" | "commit" | "message" | "alert" | "system";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "deploy", title: "Mission Control deployed", description: "Successfully deployed to GitHub Pages", timestamp: "2026-06-08T11:45:00", actor: "Polly" },
  { id: "2", type: "commit", title: "Add detail views", description: "3 widgets with expanded modal views", timestamp: "2026-06-08T10:30:00", actor: "frontend-dev" },
  { id: "3", type: "message", title: "Agent completed task", description: "the-cartographer finished research", timestamp: "2026-06-08T09:15:00", actor: "the-cartographer" },
  { id: "4", type: "alert", title: "Budget warning", description: "Daily cost at 85% of budget", timestamp: "2026-06-08T08:00:00", actor: "system" },
  { id: "5", type: "system", title: "Wiki sync complete", description: "436 notes indexed successfully", timestamp: "2026-06-08T06:00:00", actor: "system" },
  { id: "6", type: "commit", title: "Update theme system", description: "8 Polly sensibility themes added", timestamp: "2026-06-07T22:00:00", actor: "Polly" },
  { id: "7", type: "message", title: "Agent error", description: "frontend-dev failed to build", timestamp: "2026-06-07T20:30:00", actor: "frontend-dev" },
  { id: "8", type: "deploy", title: "Polly Router released", description: "v1.0.0 tagged and published", timestamp: "2026-06-07T18:00:00", actor: "Polly" },
];

const TYPE_CONFIG = {
  deploy: { icon: Rocket, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  commit: { icon: GitCommit, color: "text-blue-400", bg: "bg-blue-500/10" },
  message: { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
  alert: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  system: { icon: Activity, color: "text-[var(--muted)]", bg: "bg-[var(--sidebar-bg)]" },
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<"all" | "deploy" | "commit" | "message" | "alert">("all");

  const filtered = ACTIVITIES.filter((a) => filter === "all" || a.type === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Activity</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{ACTIVITIES.length} recent activities</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "deploy", "commit", "message", "alert"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filter === f
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "bg-[var(--sidebar-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((activity) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className={cn("flex items-center justify-center size-8 rounded-lg shrink-0", config.bg)}>
                <Icon className={cn("size-4", config.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--muted)] shrink-0">
                    <Clock className="size-3" />
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
                <div className="text-sm text-[var(--muted)]">{activity.description}</div>
                <div className="text-[10px] text-[var(--muted)] mt-1">by {activity.actor}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
