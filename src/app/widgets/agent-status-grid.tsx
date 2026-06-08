"use client";

import { useEffect, useMemo, useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Star,
  Clock,
  Play,
  Trash2,
  ScrollText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentStatusDetailContent } from "./agent-status-detail";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: "running" | "stale" | "offline" | "unknown";
  lastActive: string | null;
  messageCount: number;
  team: string | null;
  autonomy: "proactive" | "autonomous" | "reactive";
  sessionCount: number;
}

interface AgentsResponse {
  agents: Agent[];
  teams: string[];
}

type FilterMode = "all" | "running" | "stale" | "offline";
type SortMode = "name" | "lastActive" | "status";

const STATUS_COLORS: Record<string, string> = {
  running: "bg-emerald-500",
  stale: "bg-amber-400",
  offline: "bg-rose-500",
  unknown: "bg-[var(--muted)]",
};

const STATUS_LABELS: Record<string, string> = {
  running: "Running",
  stale: "Stale",
  offline: "Offline",
  unknown: "Unknown",
};

function formatAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function AgentCard({
  agent,
  expanded,
  onToggle,
}: {
  agent: Agent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.unknown;
  const isPulsing = agent.status === "running";

  return (
    <div
      className={cn(
        "relative cursor-pointer border border-[var(--card-border)]/80 bg-[var(--card-bg)]/70 text-[var(--foreground)] rounded-lg transition-all duration-200",
        "hover:border-[var(--card-border)] hover:shadow-lg hover:shadow-[var(--background)]/20 hover:-translate-y-0.5",
        expanded && "ring-1 ring-[var(--card-border)]/60"
      )}
      onClick={onToggle}
    >
      <div className="p-3 sm:p-4 flex items-start gap-3">
        <div className="text-xl sm:text-2xl shrink-0 select-none">{agent.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-[var(--foreground)] truncate">{agent.name}</span>
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-block size-2 rounded-full",
                  statusColor,
                  isPulsing && "animate-pulse"
                )}
              />
              <span className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                {STATUS_LABELS[agent.status]}
              </span>
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-[var(--muted)]">
            <span>{formatAgo(agent.lastActive)}</span>
            {agent.messageCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-[var(--sidebar-bg)] text-[var(--foreground)] border-0">
                {agent.messageCount} today
              </Badge>
            )}
            {agent.team && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-[var(--card-border)] text-[var(--muted)]">
                {agent.team}
              </Badge>
            )}
            {agent.autonomy === "proactive" && (
              <Badge className="text-[10px] px-1 py-0 h-4 bg-amber-500/20 text-amber-300 border-amber-500/30 border">
                <Star className="size-2.5 mr-0.5" />
                Proactive
              </Badge>
            )}
            {agent.autonomy === "autonomous" && (
              <Badge className="text-[10px] px-1 py-0 h-4 bg-sky-500/20 text-sky-300 border-sky-500/30 border">
                <Clock className="size-2.5 mr-0.5" />
                Autonomous
              </Badge>
            )}
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded ? (
            <ChevronUp className="size-4 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="size-4 text-[var(--muted)]" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-[var(--card-border)]/60 pt-3 space-y-3">
          <div className="text-xs text-[var(--muted)] space-y-1">
            <div className="flex justify-between">
              <span>ID</span>
              <span className="font-mono text-[var(--foreground)]">{agent.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Total sessions</span>
              <span className="text-[var(--foreground)]">{agent.sessionCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Autonomy</span>
              <span className="capitalize text-[var(--foreground)]">{agent.autonomy}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--card-border)] bg-[var(--sidebar-bg)]/50 text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                fetch("/api/actions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "spawn", agentId: agent.id }),
                }).catch(() => {});
              }}
            >
              <Play className="size-3" />
              Spawn
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--card-border)] bg-[var(--sidebar-bg)]/50 text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                fetch("/api/actions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "clearMemory", agentId: agent.id }),
                }).catch(() => {});
              }}
            >
              <Trash2 className="size-3" />
              Clear Memory
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--card-border)] bg-[var(--sidebar-bg)]/50 text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/agents/${agent.id}/logs`, "_blank");
              }}
            >
              <ScrollText className="size-3" />
              View Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--card-border)]/80 bg-[var(--card-bg)]/70 p-3 sm:p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="size-8 rounded bg-[var(--sidebar-bg)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-24 rounded bg-[var(--sidebar-bg)]" />
              <div className="h-2.5 w-16 rounded bg-[var(--sidebar-bg)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentStatusGrid() {
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("lastActive");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d: AgentsResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...data.agents];
    if (filter !== "all") {
      list = list.filter((a) => a.status === filter);
    }
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") {
        const order = { running: 0, stale: 1, offline: 2, unknown: 3 };
        return order[a.status] - order[b.status];
      }
      // lastActive desc
      const ta = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const tb = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return tb - ta;
    });
    return list;
  }, [data, filter, sort]);

  const visibleAgents = showAll ? filtered : filtered.slice(0, 6);
  const hasMore = filtered.length > 6;

  return (
    <>
      <WidgetCard title="Agent Status Grid" icon={Bot} loading={loading} onExpand={() => setDetailOpen(true)}>
        {loading ? (
          <SkeletonGrid />
        ) : data ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[var(--sidebar-bg)]/60 rounded-lg p-0.5">
                {(["all", "running", "stale", "offline"] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                      filter === f
                        ? "bg-[var(--sidebar-bg)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {f === "all" ? "All" : STATUS_LABELS[f]}
                    {f !== "all" && (
                      <span className="ml-1 text-[10px] text-[var(--muted)]">
                        {data.agents.filter((a) => a.status === f).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <ArrowUpDown className="size-3 text-[var(--muted)]" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="bg-[var(--sidebar-bg)]/60 border border-[var(--card-border)]/60 rounded-md text-xs text-[var(--foreground)] px-2 py-1 outline-none focus:ring-1 focus:ring-[var(--card-border)]"
                >
                  <option value="lastActive">Last Active</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-xs text-[var(--muted)] py-6 text-center">No agents match this filter.</div>
            ) : (
              <div className="space-y-3">
                <div
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 transition-all duration-300 ease-in-out",
                    !showAll && "max-h-[420px] overflow-hidden"
                  )}
                >
                  {visibleAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      expanded={expandedId === agent.id}
                      onToggle={() =>
                        setExpandedId((prev) => (prev === agent.id ? null : agent.id))
                      }
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => setShowAll((prev) => !prev)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-[var(--muted)] bg-[var(--sidebar-bg)]/60 border border-[var(--card-border)]/60 hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {showAll ? (
                        <>
                          <ChevronDown className="size-3.5" />
                          Show less
                        </>
                      ) : (
                        <>
                          Show all {filtered.length} agents
                          <ChevronRight className="size-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)] py-6 text-center">Error loading agents.</div>
        )}
      </WidgetCard>

      <WidgetDetail
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Agent Status — Detailed View"
      >
        <AgentStatusDetailContent data={data} />
      </WidgetDetail>
    </>
  );
}
