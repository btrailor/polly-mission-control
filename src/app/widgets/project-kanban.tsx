"use client";

import { usePolling } from "@/lib/use-polling";
import { useState, useCallback } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { FolderKanban } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  tasks: { done: number; total: number };
}

export function ProjectKanbanWidget() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      setProjects(json || []);
    } catch {
      setProjects([
        { id: "1", name: "Aleph Bees", status: "active", progress: 75, tasks: { done: 12, total: 16 } },
        { id: "2", name: "Polly Router", status: "active", progress: 90, tasks: { done: 18, total: 20 } },
        { id: "3", name: "Mission Control", status: "active", progress: 60, tasks: { done: 34, total: 40 } },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  usePolling(fetchData, { interval: 30000 });

  return (
    <>
      <WidgetCard title="Projects" icon={FolderKanban} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-xs text-[var(--muted)]">{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--sidebar-bg)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Projects">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{project.name}</span>
                <span className="text-sm text-[var(--muted)]">{project.status}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--card-bg)] mb-2">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Progress: {project.progress}%</span>
                <span>Tasks: {project.tasks?.done ?? 0}/{project.tasks?.total ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </WidgetDetail>
    </>
  );
}
