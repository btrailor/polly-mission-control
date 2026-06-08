"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "agent" | "personal" | "team";
  color: string;
  allDay: boolean;
}

interface CalendarData {
  events: CalendarEvent[];
  date: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TYPE_COLORS = {
  agent: "#a855f7",
  personal: "#3b82f6",
  team: "#f97316",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(start: string, end: string): string {
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

export function CalendarDetailContent({ data }: { data: CalendarData | null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const days = useMemo(() => {
    const result: { date: Date; events: CalendarEvent[]; isToday: boolean }[] = [];
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(year, month, i + 1);
      const dayEvents =
        data?.events.filter((e) => {
          const start = new Date(e.start);
          return isSameDay(start, d);
        }) ?? [];
      result.push({ date: d, events: dayEvents, isToday: isSameDay(d, today) });
    }
    return result;
  }, [year, month, daysInMonth, data, today]);

  const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedEvents = selectedDate
    ? data?.events.filter((e) => isSameDay(new Date(e.start), selectedDate)) ?? []
    : [];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={goToday}
            className="rounded-md px-3 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors border border-[var(--card-border)]/50"
          >
            Today
          </button>
          <button
            onClick={goNext}
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-sm font-semibold text-[var(--foreground)]">{monthName}</span>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-[var(--card-border)]/50 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--card-border)]/50 bg-[var(--sidebar-bg)]/30">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="py-2 text-center text-[10px] font-medium text-[var(--muted)] uppercase"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] bg-[var(--sidebar-bg)]/10 border-r border-b border-[var(--sidebar-bg)]/20" />
          ))}

          {days.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day.date, selectedDate);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "min-h-[80px] border-r border-b border-[var(--sidebar-bg)]/20 p-1 text-left transition-colors",
                  day.isToday && "bg-[var(--sidebar-bg)]/30",
                  isSelected && "bg-[var(--sidebar-bg)]/40 ring-1 ring-[var(--card-border)]/50",
                  !isSelected && "hover:bg-[var(--sidebar-bg)]/20"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1",
                  day.isToday ? "text-[var(--accent)]" : "text-[var(--muted)]"
                )}>
                  {i + 1}
                </div>

                <div className="flex flex-wrap gap-0.5">
                  {day.events.slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      className="h-1.5 rounded-full flex-1 min-w-[8px]"
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    />
                  ))}
                  {day.events.length > 4 && (
                    <span className="text-[8px] text-[var(--muted)] ml-0.5">+{day.events.length - 4}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {[
          { label: "Agent", color: TYPE_COLORS.agent },
          { label: "Personal", color: TYPE_COLORS.personal },
          { label: "Team", color: TYPE_COLORS.team },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-[var(--muted)]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div className="rounded-lg border border-[var(--card-border)]/50 bg-[var(--sidebar-bg)]/20 p-4">
          <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h4>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No events for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-md bg-[var(--sidebar-bg)]/40 p-3"
                >
                  <div
                    className="mt-0.5 size-2 rounded-full shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)]">{event.title}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {formatTime(event.start, event.end)}
                    </div>
                    {event.allDay && (
                      <span className="text-[10px] text-[var(--muted)]">All day</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Events List */}
      {data && data.events.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[var(--foreground)] uppercase tracking-wider mb-3">All Upcoming Events</h4>
          <div className="space-y-1.5">
            {data.events
              .filter((e) => new Date(e.end) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 10)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--sidebar-bg)]/30 transition-colors"
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--foreground)] truncate">{event.title}</div>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] shrink-0">
                    {new Date(event.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
