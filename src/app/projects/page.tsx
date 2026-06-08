"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, GitBranch, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  progress: number;
  tasks: { done: number; total: number };
  lastUpdated: string;
  repo?: string;
}

const PROJECTS: Project[] = [
  { id: "1", name: "Aleph Bees", description: "Firmware for Aleph audio hardware", status: "active", progress: 75, tasks: { done: 12, total: 16 }, lastUpdated: "2026-06-07", repo: "aleph-bees" },
  { id: "2", name: "Polly Router", description: "Intelligent LLM routing proxy", status: "active", progress: 90, tasks: { done: 18, total: 20 }, lastUpdated: "2026-06-08", repo: "polly-router" },
  { id: "3", name: "Mission Control", description: "Personal + agent operations dashboard", status: "active", progress: 85, tasks: { done: 34, total: 40 }, lastUpdated: "2026-06-08", repo: "polly-mission-control" },
  { id: "4", name: "GBrain Integration", description: "Graph brain synthesis layer", status: "paused", progress: 60, tasks: { done: 6, total: 10 }, lastUpdated: "2026-05-30", repo: "gbrain" },
  { id: "5", name: "EdgeLLM", description: "Edge language model experiments", status: "active", progress: 30, tasks: { done: 3, total: 10 }, lastUpdated: "2026-06-05", repo: "edgelldesk" },
];

const STATUS_COLORS = {
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  completed: "bg-blue-500",
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all");

  const filtered = PROJECTS.filter((p) => filter === "all" || p.status === filter);

  const stats = {
    total: PROJECTS.length,
    active: PROJECTS.filter((p) => p.status === "active").length,
    paused: PROJECTS.filter((p) => p.status === "paused").length,
    completed: PROJECTS.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{stats.total} projects · {stats.active} active</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-blue-400" },
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "Paused", value: stats.paused, color: "text-amber-400" },
          { label: "Completed", value: stats.completed, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <div className="text-xs text-[var(--muted)] mb-1">{stat.label}</div>
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "active", "paused", "completed"] as const).map((f) => (
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 hover:border-[var(--accent)]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FolderKanban className="size-5 text-[var(--accent)]" />
                <div>
                  <div className="font-medium">{project.name}</div>
                  {project.repo && <div className="text-[10px] text-[var(--muted)]">{project.repo}</div>}
                </div>
              </div>
              <div className={cn("size-2 rounded-full", STATUS_COLORS[project.status])} />
            </div>

            <p className="text-sm text-[var(--muted)] mb-3">{project.description}</p>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--muted)]">{project.progress}% complete</span>
                <span className="text-xs text-[var(--muted)]">{project.tasks.done}/{project.tasks.total} tasks</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--sidebar-border)]">
                <div className={cn("h-full rounded-full", project.status === "active" ? "bg-emerald-500" : project.status === "paused" ? "bg-amber-500" : "bg-blue-500")} style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                {project.lastUpdated}
              </div>
              <Badge variant="secondary" className="text-[9px]">
                {project.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
