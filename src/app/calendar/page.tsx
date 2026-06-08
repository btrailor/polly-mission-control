"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "agent" | "personal" | "team";
  color: string;
}

const TYPE_COLORS = {
  agent: "#a855f7",
  personal: "#3b82f6",
  team: "#f97316",
};

const EVENTS: CalendarEvent[] = [
  { id: "1", title: "Morning Brief", start: "2026-06-08T08:00:00", end: "2026-06-08T08:30:00", type: "agent", color: TYPE_COLORS.agent },
  { id: "2", title: "Code Review", start: "2026-06-08T10:00:00", end: "2026-06-08T11:00:00", type: "team", color: TYPE_COLORS.team },
  { id: "3", title: "Lunch", start: "2026-06-08T12:00:00", end: "2026-06-08T13:00:00", type: "personal", color: TYPE_COLORS.personal },
  { id: "4", title: "Wiki Lint", start: "2026-06-09T06:00:00", end: "2026-06-09T06:30:00", type: "agent", color: TYPE_COLORS.agent },
  { id: "5", title: "Design Sync", start: "2026-06-09T14:00:00", end: "2026-06-09T15:00:00", type: "team", color: TYPE_COLORS.team },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const selectedEvents = EVENTS.filter((e) => isSameDay(new Date(e.start), selectedDate));

  const days = useMemo(() => {
    const result: { date: Date; events: CalendarEvent[]; isToday: boolean }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      result.push({
        date: d,
        events: EVENTS.filter((e) => isSameDay(new Date(e.start), d)),
        isToday: isSameDay(d, new Date()),
      });
    }
    return result;
  }, [year, month, daysInMonth]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{EVENTS.length} events this month</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] text-xs font-medium hover:bg-[var(--sidebar-bg)] transition-colors">
            Today
          </button>
          <button onClick={goNext} className="p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--sidebar-bg)] hover:text-[var(--foreground)] transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="text-lg font-semibold mb-4">{monthName}</div>

      <div className="grid grid-cols-7 gap-px rounded-lg border border-[var(--card-border)] overflow-hidden">
        {DAYS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-[var(--muted)] uppercase bg-[var(--sidebar-bg)]">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] bg-[var(--card-bg)]" />
        ))}

        {days.map((day, i) => {
          const isSelected = isSameDay(day.date, selectedDate);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "min-h-[80px] p-1.5 text-left transition-colors border-t border-[var(--card-border)]",
                day.isToday && "bg-[var(--accent)]/5",
                isSelected && "ring-1 ring-[var(--accent)]",
                !isSelected && "hover:bg-[var(--sidebar-bg)]/30"
              )}
            >
              <div className={cn("text-xs font-medium mb-1", day.isToday ? "text-[var(--accent)]" : "text-[var(--foreground)]")}>
                {i + 1}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {day.events.slice(0, 3).map((event) => (
                  <div key={event.id} className="h-1.5 rounded-full flex-1 min-w-[8px]" style={{ backgroundColor: event.color }} title={event.title} />
                ))}
                {day.events.length > 3 && <span className="text-[8px] text-[var(--muted)]">+{day.events.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - {new Date(event.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sidebar-bg)] text-[var(--muted)] capitalize">
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
