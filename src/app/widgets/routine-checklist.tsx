"use client";

import { useMemo, useState } from "react";
import { usePolling } from "@/lib/use-polling";
import { WidgetCard } from "@/app/widget-card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ChevronDown, ChevronRight, Clock, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetDetail } from "@/app/widget-detail";
import { RoutineChecklistDetailContent } from "./routine-checklist-detail";

interface Routine {
  id: string;
  name: string;
  category: "morning" | "afternoon" | "evening";
  type: "personal" | "agent";
  schedule?: string;
  completed: boolean;
  streak: number;
  lastCompleted: string | null;
}

interface RoutineData {
  routines: Routine[];
}

type GroupKey = "morning" | "afternoon" | "evening";

const GROUP_LABELS: Record<GroupKey, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const GROUP_ORDER: GroupKey[] = ["morning", "afternoon", "evening"];

function getDaysForHeatmap(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function dayInitial(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
}

function getHeatmapLevel(routine: Routine, dateStr: string): number {
  if (!routine.lastCompleted) return 0;
  if (routine.lastCompleted === dateStr) {
    return routine.completed ? 2 : 1;
  }
  // For historical days, we only know lastCompleted; prior days unknown = 0
  // If lastCompleted is before dateStr, that day was not completed
  if (routine.lastCompleted > dateStr) {
    // lastCompleted is after this day — if routine is recurring, this day might have been done
    // Heuristic: if streak covers this day, assume completed
    const last = new Date(routine.lastCompleted + "T00:00:00");
    const target = new Date(dateStr + "T00:00:00");
    const diffDays = Math.floor((last.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < routine.streak) return 2;
  }
  return 0;
}

function SkeletonRoutine() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-md bg-slate-800/40 px-2 py-2">
          <div className="flex items-center gap-2">
            <span className="size-4 rounded bg-slate-800 animate-pulse" />
            <span className="block h-3.5 w-24 rounded bg-slate-800 animate-pulse" />
          </div>
          <span className="h-4 w-10 rounded bg-slate-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function RoutineChecklistWidget() {
  const [data, setData] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Record<GroupKey, boolean>>({
    morning: true,
    afternoon: false,
    evening: false,
  });
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);

  const days = useMemo(() => getDaysForHeatmap(), []);

  const fetchRoutines = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error("Failed to fetch");
      const json: RoutineData = await res.json();
      setData(json);
      // Persist to localStorage
      localStorage.setItem("routines-cache", JSON.stringify(json));
    } catch {
      setError(true);
      // Fallback to localStorage
      const cached = localStorage.getItem("routines-cache");
      if (cached) {
        try {
          setData(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };


  const toggleRoutine = async (routine: Routine) => {
    if (toggling.has(routine.id)) return;
    const next = new Set(toggling);
    next.add(routine.id);
    setToggling(next);

    const newCompleted = !routine.completed;

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        routines: prev.routines.map((r) =>
          r.id === routine.id
            ? {
                ...r,
                completed: newCompleted,
                streak: newCompleted
                  ? r.lastCompleted === getYesterday()
                    ? r.streak + 1
                    : 1
                  : Math.max(0, r.streak - 1),
                lastCompleted: newCompleted ? new Date().toISOString().split("T")[0] : r.lastCompleted,
              }
            : r
        ),
      };
    });

    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: routine.id, completed: newCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const json = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          routines: prev.routines.map((r) =>
            r.id === routine.id ? json.routine : r
          ),
        };
      });
      // Update cache
      const updated = {
        routines: data?.routines.map((r) =>
          r.id === routine.id ? json.routine : r
        ) ?? [],
      };
      localStorage.setItem("routines-cache", JSON.stringify(updated));
    } catch {
      // Revert optimistic update on error
      fetchRoutines();
    } finally {
      setToggling((prev) => {
        const n = new Set(prev);
        n.delete(routine.id);
        return n;
      });
    }
  };

  const grouped = useMemo(() => {
    const map: Record<GroupKey, Routine[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const r of data?.routines ?? []) {
      if (map[r.category]) map[r.category].push(r);
    }
    return map;
  }, [data]);

  const groupCompletion = (routines: Routine[]) => {
    if (routines.length === 0) return 0;
    return Math.round((routines.filter((r) => r.completed).length / routines.length) * 100);
  };

  return (
    <>
      <WidgetCard title="Routines" icon={CheckSquare} loading={loading} onExpand={() => setDetailOpen(true)}>
      {loading ? (
        <SkeletonRoutine />
      ) : error && !data ? (
        <div className="text-xs text-slate-500">Error loading routines</div>
      ) : (
        <div className="space-y-3">
          {GROUP_ORDER.map((group) => {
            const routines = grouped[group];
            if (!routines || routines.length === 0) return null;
            const pct = groupCompletion(routines);
            const isExpanded = expanded[group];

            return (
              <div key={group} className="space-y-1.5">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }))
                  }
                  className="flex w-full items-center justify-between rounded-md bg-slate-800/50 px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="size-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="size-3.5 text-slate-400" />
                    )}
                    <span>{GROUP_LABELS[group]}</span>
                    <span className="text-slate-500">({routines.filter((r) => r.completed).length}/{routines.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{pct}%</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-1 pl-1">
                    {routines.map((routine) => (
                      <div
                        key={routine.id}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2 py-1.5 transition-all duration-200",
                          routine.completed
                            ? "bg-slate-800/30"
                            : "bg-slate-800/60 hover:bg-slate-800/80"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleRoutine(routine)}
                            disabled={toggling.has(routine.id)}
                            className={cn(
                              "relative flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-200",
                              routine.completed
                                ? routine.type === "agent"
                                  ? "border-purple-500/60 bg-purple-500/20"
                                  : "border-sky-500/60 bg-sky-500/20"
                                : "border-slate-600 bg-slate-900/50 hover:border-slate-500"
                            )}
                          >
                            {routine.completed && (
                              <svg
                                className={cn(
                                  "size-2.5 transition-transform duration-200",
                                  routine.type === "agent" ? "text-purple-400" : "text-sky-400"
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {toggling.has(routine.id) && (
                              <Loader2 className="absolute size-3 animate-spin text-slate-400" />
                            )}
                          </button>
                          <span
                            className={cn(
                              "truncate text-xs transition-all duration-200",
                              routine.completed ? "text-slate-500 line-through" : "text-slate-200"
                            )}
                          >
                            {routine.name}
                          </span>
                          {routine.type === "agent" && routine.schedule && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/20 px-1 py-0"
                            >
                              <Clock className="size-2.5 mr-0.5" />
                              {routine.schedule}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {routine.streak > 0 && (
                            <span
                              className={cn(
                                "flex items-center gap-0.5 text-[10px] font-medium",
                                routine.streak >= 7
                                  ? "text-amber-400"
                                  : routine.streak >= 3
                                  ? "text-orange-400"
                                  : "text-slate-400"
                              )}
                              title={`${routine.streak} day streak`}
                            >
                              <Flame className="size-3" />
                              {routine.streak}
                            </span>
                          )}

                          {/* Mini heatmap */}
                          <div className="hidden sm:flex items-center gap-px">
                            {days.map((day) => {
                              const level = getHeatmapLevel(routine, day);
                              return (
                                <div
                                  key={day}
                                  className={cn(
                                    "size-1.5 rounded-[1px]",
                                    level === 2
                                      ? routine.type === "agent"
                                        ? "bg-purple-500"
                                        : "bg-sky-500"
                                      : level === 1
                                      ? "bg-slate-700"
                                      : "bg-slate-800"
                                  )}
                                  title={`${day}: ${level === 2 ? "done" : level === 1 ? "today" : "miss"}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>

    <WidgetDetail
      isOpen={detailOpen}
      onClose={() => setDetailOpen(false)}
      title="Routines — Detailed View"
    >
      <RoutineChecklistDetailContent data={data} />
    </WidgetDetail>
  </>
  );
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
