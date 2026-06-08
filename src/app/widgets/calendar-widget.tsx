"use client";

import { useMemo, useState, useCallback } from "react";
import { usePolling } from "@/lib/use-polling";
import { WidgetCard } from "@/app/widget-card";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetDetail } from "@/app/widget-detail";
import { CalendarDetailContent } from "./calendar-detail";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "agent" | "personal" | "team";
  color: string;
  allDay: boolean;
}

const TYPE_COLORS = {
  agent: "#a855f7",
  personal: "#3b82f6",
  team: "#f97316",
};

interface CalendarData {
  events: CalendarEvent[];
  date: string;
}

interface DayInfo {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

function getStartOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = (day + 6) % 7; // shift so Monday is start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDayHeader(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(s)} – ${fmt(e)}`;
}

function SkeletonCalendar() {
  return (
    <div className="grid grid-cols-7 gap-1">
      {DAY_LABELS.map((label) => (
        <div key={label} className="text-center text-[10px] text-[var(--muted)] py-1">
          {label}
        </div>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="min-h-[80px] rounded-md bg-[var(--sidebar-bg)]/40 animate-pulse" />
      ))}
    </div>
  );
}

export function CalendarWidget() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; event: CalendarEvent } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => {
    const d = getStartOfWeek(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const days: DayInfo[] = useMemo(() => {
    const result: DayInfo[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const isToday = isSameDay(d, today);
      const dayEvents =
        data?.events.filter((e) => {
          const start = new Date(e.start);
          return isSameDay(start, d);
        }) ?? [];
      result.push({ date: d, events: dayEvents, isToday });
    }
    return result;
  }, [weekStart, today, data]);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d: CalendarData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-refresh every 5 minutes
  usePolling(fetchData, { interval: 300000 });
  const goPrev = () => setWeekOffset((o) => o - 1);
  const goNext = () => setWeekOffset((o) => o + 1);
  const goToday = () => setWeekOffset(0);

  const weekRangeLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(weekStart)} – ${fmt(end)}`;
  }, [weekStart]);

  return (
    <>
      <WidgetCard title="Calendar" icon={CalendarDays} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-2">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={goPrev}
                className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Previous week"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={goToday}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors",
                  weekOffset === 0 && "text-[var(--muted)] cursor-default hover:bg-transparent hover:text-[var(--muted)]"
                )}
                disabled={weekOffset === 0}
              >
                Today
              </button>
              <button
                onClick={goNext}
                className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Next week"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <span className="text-[10px] text-[var(--muted)] font-mono">{weekRangeLabel}</span>
          </div>

          {loading ? (
            <SkeletonCalendar />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center text-[10px] py-1 rounded-t-md font-medium",
                    day.isToday
                      ? "text-[var(--foreground)] bg-[var(--sidebar-bg)]/60"
                      : "text-[var(--muted)]"
                  )}
                >
                  {DAY_LABELS[i]} {formatDayHeader(day.date)}
                </div>
              ))}

              {/* Day cells */}
              {days.map((day, i) => {
                const allEvents = day.events;
                const visible = allEvents.slice(0, MAX_VISIBLE);
                const hiddenCount = allEvents.length - visible.length;
                const isExpanded = expandedDay === day.date.toISOString().split("T")[0];
                const displayEvents = isExpanded ? allEvents : visible;

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[80px] rounded-b-md border border-transparent p-1 flex flex-col gap-1 transition-colors",
                      day.isToday
                        ? "border-[var(--card-border)]/60 bg-[var(--sidebar-bg)]/30"
                        : "bg-[var(--sidebar-bg)]/20"
                    )}
                  >
                    {displayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="group relative rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight cursor-default transition-all hover:brightness-110"
                        style={{ backgroundColor: event.color + "26", color: event.color, borderLeft: `2px solid ${event.color}` }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            event,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className="block truncate">{event.title}</span>
                      </div>
                    ))}

                    {!isExpanded && hiddenCount > 0 && (
                      <button
                        onClick={() =>
                          setExpandedDay(day.date.toISOString().split("T")[0])
                        }
                        className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] underline underline-offset-2 text-left px-1"
                      >
                        +{hiddenCount} more
                      </button>
                    )}

                    {isExpanded && allEvents.length > MAX_VISIBLE && (
                      <button
                        onClick={() => setExpandedDay(null)}
                        className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] underline underline-offset-2 text-left px-1"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-3 pt-1">
            {[
              { label: "Agent", color: TYPE_COLORS.agent },
              { label: "Personal", color: TYPE_COLORS.personal },
              { label: "Team", color: TYPE_COLORS.team },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-[var(--muted)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none rounded-md bg-[var(--background)] border border-[var(--card-border)] px-2 py-1.5 shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-[11px] font-medium text-[var(--foreground)]">{tooltip.event.title}</div>
            <div className="text-[10px] text-[var(--muted)]">{formatTimeRange(tooltip.event.start, tooltip.event.end)}</div>
          </div>
        )}
      </WidgetCard>

      <WidgetDetail
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Calendar — Detailed View"
      >
        <CalendarDetailContent data={data} />
      </WidgetDetail>
    </>
  );
}
