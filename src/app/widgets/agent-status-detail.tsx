"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Star,
  Clock,
  Play,
  Trash2,
  ScrollText,
  Search,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

type FilterMode = "all" | "running" | "stale" | "offline" | "unknown";
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

function AgentRow({
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
        "rounded-lg border border-[var(--card-border)]/80 bg-[var(--card-bg)]/70 transition-all duration-200",
        "hover:border-[var(--card-border)] hover:shadow-lg hover:shadow-[var(--background)]/20",
        expanded && "ring-1 ring-[var(--card-border)]/60"
      )}
    >
      <div
        className="p-3 flex items-start gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="text-xl shrink-0 select-none">{agent.emoji}</div>
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
            <ChevronDown className="size-4 text-[var(--muted)]" />
          ) : (
            <ChevronRight className="size-4 text-[var(--muted)]" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--card-border)]/60 pt-3 space-y-3">
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

          <div className="flex gap-2 flex-wrap">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--card-border)] bg-[var(--sidebar-bg)]/50 text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-colors"
              onClick={() => {
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
              onClick={() => {
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
              onClick={() => {
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

export function AgentStatusDetailContent({ data }: { data: AgentsResponse | null }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("lastActive");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const teams = useMemo(() => {
    if (!data) return [];
    const unique = new Set<string>();
    data.agents.forEach((a) => {
      if (a.team) unique.add(a.team);
    });
    return Array.from(unique).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...data.agents];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.team && a.team.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filter !== "all") {
      list = list.filter((a) => a.status === filter);
    }

    // Team filter
    if (teamFilter !== "all") {
      list = list.filter((a) => a.team === teamFilter);
    }

    // Sort
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
  }, [data, search, filter, teamFilter, sort]);

  // Status counts
  const statusCounts = useMemo(() => {
    if (!data) return {} as Record<string, number>;
    const counts: Record<string, number> = { running: 0, stale: 0, offline: 0, unknown: 0 };
    data.agents.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Team breakdown
  const teamCounts = useMemo(() => {
    if (!data) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    data.agents.forEach((a) => {
      const team = a.team || "No Team";
      counts[team] = (counts[team] || 0) + 1;
    });
    return counts;
  }, [data]);

  if (!data) {
    return (
      <div className="text-xs text-[var(--muted)] py-6 text-center">Error loading agents.</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["running", "stale", "offline", "unknown"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "all" : status)}
            className={cn(
              "rounded-lg border p-3 text-left transition-all duration-200",
              filter === status
                ? "border-[var(--card-border)] bg-[var(--sidebar-bg)]/60 ring-1 ring-[var(--card-border)]/40"
                : "border-[var(--card-border)]/60 bg-[var(--card-bg)]/40 hover:bg-[var(--sidebar-bg)]/30"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={cn(
                  "inline-block size-2 rounded-full",
                  STATUS_COLORS[status],
                  status === "running" && "animate-pulse"
                )}
              />
              <span className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                {STATUS_LABELS[status]}
              </span>
            </div>
            <div className="text-2xl font-semibold text-[var(--foreground)]">
              {statusCounts[status] || 0}
            </div>
          </button>
        ))}
      </div>

      {/* Team Breakdown */}
      {Object.keys(teamCounts).length > 0 && (
        <div className="rounded-lg border border-[var(--card-border)]/60 bg-[var(--card-bg)]/40 p-3">
          <h4 className="text-xs font-medium text-[var(--foreground)] uppercase tracking-wider mb-2">
            Team Breakdown
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(teamCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([team, count]) => (
                <button
                  key={team}
                  onClick={() => setTeamFilter(teamFilter === team ? "all" : team)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    teamFilter === team
                      ? "bg-[var(--sidebar-bg)] text-[var(--foreground)] ring-1 ring-[var(--card-border)]/40"
                      : "bg-[var(--sidebar-bg)]/40 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-bg)]/60"
                  )}
                >
                  <span className="text-[var(--foreground)]">{count}</span>
                  <span>{team}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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

        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 bg-[var(--sidebar-bg)]/60 border border-[var(--card-border)]/60 rounded-md text-xs text-[var(--foreground)] pl-7 pr-2 py-1 outline-none focus:ring-1 focus:ring-[var(--card-border)] placeholder:text-[var(--muted)]"
            />
          </div>
          <div className="flex items-center gap-1">
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
      </div>

      {/* Results count */}
      <div className="text-[10px] text-[var(--muted)]">
        Showing {filtered.length} of {data.agents.length} agents
        {filter !== "all" && ` · ${STATUS_LABELS[filter]}`}
        {teamFilter !== "all" && ` · Team: ${teamFilter}`}
        {search.trim() && ` · Search: "${search}"`}
      </div>

      {/* Agent List */}
      {filtered.length === 0 ? (
        <div className="text-xs text-[var(--muted)] py-6 text-center">
          No agents match the current filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              expanded={expandedId === agent.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === agent.id ? null : agent.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
