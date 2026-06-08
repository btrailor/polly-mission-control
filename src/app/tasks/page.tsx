"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
}

const TASKS: Task[] = [
  { id: "1", title: "Review agent PRs", status: "in-progress", priority: "high", dueDate: "2026-06-08", assignee: "Polly", tags: ["agents", "review"] },
  { id: "2", title: "Update vault index", status: "todo", priority: "medium", dueDate: "2026-06-09", assignee: null, tags: ["vault"] },
  { id: "3", title: "Fix calendar widget", status: "done", priority: "high", dueDate: "2026-06-07", assignee: "frontend-dev", tags: ["ui", "bug"] },
  { id: "4", title: "Write documentation", status: "todo", priority: "low", dueDate: null, assignee: null, tags: ["docs"] },
  { id: "5", title: "Deploy mission control", status: "done", priority: "high", dueDate: "2026-06-08", assignee: "Polly", tags: ["deploy"] },
];

const STATUS_COLORS = {
  todo: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const PRIORITY_ICONS = {
  low: Flag,
  medium: Flag,
  high: Flag,
};

const PRIORITY_COLORS = {
  low: "text-[var(--muted)]",
  medium: "text-amber-400",
  high: "text-red-400",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(TASKS);
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const [newTask, setNewTask] = useState("");

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = t.status === "todo" ? "in-progress" : t.status === "in-progress" ? "done" : "todo";
        return { ...t, status: next };
      })
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newTask,
        status: "todo",
        priority: "medium",
        dueDate: null,
        assignee: null,
        tags: [],
      },
    ]);
    setNewTask("");
  };

  const filtered = tasks.filter((t) => filter === "all" || t.status === filter);
  const stats = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "todo", "in-progress", "done"] as const).map((f) => (
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
              {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 opacity-60">
                {f === "all" ? tasks.length : f === "todo" ? stats.todo : f === "in-progress" ? stats.inProgress : stats.done}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* New task input */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="flex-1 h-10 px-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={addTask}
          className="h-10 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/30 transition-colors"
          >
            <button
              onClick={() => toggleStatus(task.id)}
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded border transition-all",
                task.status === "done"
                  ? "bg-emerald-500/20 border-emerald-500/60"
                  : task.status === "in-progress"
                  ? "bg-blue-500/20 border-blue-500/60"
                  : "border-[var(--card-border)]"
              )}
            >
              {task.status === "done" && <svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {task.status === "in-progress" && <div className="size-1.5 rounded-full bg-blue-400" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className={cn("text-sm", task.status === "done" && "line-through text-[var(--muted)]")}>
                {task.title}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
                {task.assignee && <span className="text-[10px] text-[var(--muted)]">@{task.assignee}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {task.dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                  <Calendar className="size-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              <Flag className={cn("size-3.5", PRIORITY_COLORS[task.priority])} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
