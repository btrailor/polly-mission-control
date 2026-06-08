"use client";

import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

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

const GROUP_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function HeatmapCalendar({ routine }: { routine: Routine }) {
  const days: { date: Date; completed: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const completed = !!routine.lastCompleted && routine.lastCompleted >= dateStr;
    days.push({ date: d, completed });
  }

  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map((day, i) => (
        <div
          key={i}
          className={cn(
            "aspect-square rounded-[2px] border transition-colors",
            day.completed
              ? routine.type === "agent"
                ? "bg-purple-500/60 border-purple-500/40"
                : "bg-sky-500/60 border-sky-500/40"
              : "bg-[var(--sidebar-bg)]/50 border-[var(--card-border)]/30"
          )}
          title={`${day.date.toLocaleDateString()}: ${day.completed ? "Completed" : "Not done"}`}
        />
      ))}
    </div>
  );
}

function RoutineItem({ routine }: { routine: Routine }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)]/50 bg-[var(--sidebar-bg)]/30 p-3">
      <div
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-all",
          routine.completed
            ? routine.type === "agent"
              ? "border-purple-500/60 bg-purple-500/20"
              : "border-sky-500/60 bg-sky-500/20"
            : "border-[var(--card-border)] bg-[var(--background)]/50"
        )}
      >
        {routine.completed && (
          <svg
            className={cn(
              "size-3 transition-transform",
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
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-sm font-medium",
            routine.completed ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"
          )}>
            {routine.name}
          </span>
          {routine.type === "agent" && routine.schedule && (
            <Badge
              variant="secondary"
              className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/20 px-1 py-0"
            >
              <Clock className="size-2.5 mr-0.5" />
              {routine.schedule}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {routine.streak > 0 && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-medium",
                routine.streak >= 7
                  ? "text-amber-400"
                  : routine.streak >= 3
                  ? "text-orange-400"
                  : "text-[var(--muted)]"
              )}
            >
              <Flame className="size-3" />
              {routine.streak} day streak
            </span>
          )}
          {routine.lastCompleted && (
            <span className="text-[10px] text-[var(--muted)]">
              Last: {new Date(routine.lastCompleted + "T00:00:00").toLocaleDateString()}
            </span>
          )}
          <span className="text-[10px] text-[var(--muted)]">
            {GROUP_LABELS[routine.category]}
          </span>
        </div>
      </div>

      <div className="shrink-0 w-24">
        <HeatmapCalendar routine={routine} />
      </div>
    </div>
  );
}

function SummaryStats({ routines }: { routines: Routine[] }) {
  const total = routines.length;
  const completed = routines.filter((r) => r.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalStreak = routines.reduce((sum, r) => sum + r.streak, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Routines", value: total.toString(), icon: <CheckSquare className="size-4 text-[var(--muted)]" /> },
        { label: "Completed", value: `${completed}/${total}`, icon: <CheckSquare className="size-4 text-emerald-400" /> },
        { label: "Progress", value: `${pct}%`, icon: <CheckSquare className="size-4 text-blue-400" /> },
        { label: "Total Streaks", value: totalStreak.toString(), icon: <Flame className="size-4 text-amber-400" /> },
      ].map((stat) => (
        <div key={stat.label} className="rounded-lg bg-[var(--sidebar-bg)]/50 border border-[var(--card-border)]/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            {stat.icon}
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="text-lg font-bold text-[var(--foreground)]">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function RoutineChecklistDetailContent({ data }: { data: RoutineData | null }) {
  if (!data || data.routines.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[var(--muted)]">No routines available</div>
      </div>
    );
  }

  const grouped = {
    morning: data.routines.filter((r) => r.category === "morning"),
    afternoon: data.routines.filter((r) => r.category === "afternoon"),
    evening: data.routines.filter((r) => r.category === "evening"),
  };

  return (
    <div className="space-y-4">
      <SummaryStats routines={data.routines} />

      {Object.entries(grouped).map(([group, routines]) => {
        if (routines.length === 0) return null;
        const completed = routines.filter((r) => r.completed).length;
        const pct = Math.round((completed / routines.length) * 100);

        return (
          <div key={group}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
                {GROUP_LABELS[group]}
              </h4>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--sidebar-bg)]">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  {completed}/{routines.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {routines.map((routine) => (
                <RoutineItem key={routine.id} routine={routine} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
