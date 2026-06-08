"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Search, Users, Activity, Clock, Filter } from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  running: "bg-emerald-500",
  stale: "bg-amber-400",
  offline: "bg-rose-500",
  unknown: "bg-[var(--muted)]",
};

export default function AgentsPage() {
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "running" | "stale" | "offline">("all");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d: AgentsResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data?.agents.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                         a.id.toLowerCase().includes(search.toLowerCase()) ||
                         (a.team?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesFilter = filter === "all" || a.status === filter;
    return matchesSearch && matchesFilter;
  }) ?? [];

  const stats = {
    total: data?.agents.length ?? 0,
    running: data?.agents.filter((a) => a.status === "running").length ?? 0,
    stale: data?.agents.filter((a) => a.status === "stale").length ?? 0,
    offline: data?.agents.filter((a) => a.status === "offline").length ?? 0,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{stats.total} agents across {data?.teams.length ?? 0} teams</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-blue-400" },
          { label: "Running", value: stats.running, icon: Activity, color: "text-emerald-400" },
          { label: "Stale", value: stats.stale, icon: Clock, color: "text-amber-400" },
          { label: "Offline", value: stats.offline, icon: Bot, color: "text-rose-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("size-4", stat.color)} />
              <span className="text-xs text-[var(--muted)]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[var(--muted)]" />
          {(["all", "running", "stale", "offline"] as const).map((f) => (
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

      {/* Agent Grid */}
      {loading ? (
        <div className="text-sm text-[var(--muted)]">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-[var(--muted)]">@{agent.id}</div>
                  </div>
                </div>
                <div className={cn("size-2 rounded-full", STATUS_COLORS[agent.status])} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                {agent.team && (
                  <Badge variant="secondary" className="text-[10px]">{agent.team}</Badge>
                )}
                <Badge variant="outline" className="text-[10px]">{agent.autonomy}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[var(--sidebar-bg)]">
                  <div className="text-[var(--muted)]">Messages</div>
                  <div className="font-medium">{agent.messageCount}</div>
                </div>
                <div className="p-2 rounded bg-[var(--sidebar-bg)]">
                  <div className="text-[var(--muted)]">Sessions</div>
                  <div className="font-medium">{agent.sessionCount}</div>
                </div>
              </div>

              {agent.lastActive && (
                <div className="text-[10px] text-[var(--muted)] mt-3">
                  Last active: {new Date(agent.lastActive).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
