"use client";

import { useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { Zap, RotateCw, Bell, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

export function QuickActionsWidget() {
  const [executing, setExecuting] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      id: "sync-vault",
      label: "Sync Vault",
      icon: RotateCw,
      color: "text-blue-400",
      onClick: async () => {
        setExecuting("sync-vault");
        try {
          await fetch("/api/actions/sync-vault", { method: "POST" });
        } finally {
          setTimeout(() => setExecuting(null), 2000);
        }
      },
    },
    {
      id: "run-lint",
      label: "Run Wiki Lint",
      icon: Shield,
      color: "text-emerald-400",
      onClick: async () => {
        setExecuting("run-lint");
        try {
          await fetch("/api/actions/run-lint", { method: "POST" });
        } finally {
          setTimeout(() => setExecuting(null), 2000);
        }
      },
    },
    {
      id: "refresh-agents",
      label: "Refresh Agents",
      icon: Activity,
      color: "text-purple-400",
      onClick: async () => {
        setExecuting("refresh-agents");
        try {
          await fetch("/api/actions/refresh-agents", { method: "POST" });
        } finally {
          setTimeout(() => setExecuting(null), 2000);
        }
      },
    },
    {
      id: "send-brief",
      label: "Send Brief",
      icon: Bell,
      color: "text-amber-400",
      onClick: async () => {
        setExecuting("send-brief");
        try {
          await fetch("/api/actions/send-brief", { method: "POST" });
        } finally {
          setTimeout(() => setExecuting(null), 2000);
        }
      },
    },
  ];

  return (
    <WidgetCard title="Quick Actions" icon={Zap} onExpand={() => {}}>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isExecuting = executing === action.id;

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={!!executing}
              className={cn(
                "flex flex-col items-center gap-2 py-3 px-2 rounded-lg border transition-all",
                "border-[var(--card-border)] bg-[var(--sidebar-bg)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30",
                isExecuting && "opacity-50 cursor-wait"
              )}
            >
              {isExecuting ? (
                <RotateCw className="size-4 animate-spin text-[var(--accent)]" />
              ) : (
                <Icon className={cn("size-4", action.color)} />
              )}
              <span className="text-xs text-[var(--foreground)]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}
