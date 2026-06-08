"use client";

import { useEffect, useState } from "react";
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

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d: Project[]) => {
        setProjects(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <WidgetCard title="Projects" icon={FolderKanban} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-3">
          {projects.length === 0 && !loading ? (
            <div className="text-xs text-[var(--muted)]">No projects</div>
          ) : (
            projects.slice(0, 4).map((project) => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-[10px] text-[var(--muted)]">{project.status}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--sidebar-border)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  {project.tasks.done}/{project.tasks.total} tasks
                </div>
              </div>
            ))
          )}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Projects — All">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{project.name}</span>
                <span className="text-xs text-[var(--muted)]">{project.status}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--card-border)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${project.progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-[var(--muted)]">
                <span>{project.progress}% complete</span>
                <span>{project.tasks.done}/{project.tasks.total} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </WidgetDetail>
    </>
  );
}
