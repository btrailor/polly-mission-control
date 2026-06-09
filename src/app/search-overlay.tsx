"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Bot, FolderKanban, CheckSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "agent" | "project" | "task" | "event";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_RESULTS: SearchResult[] = [
  { id: "1", type: "agent", title: "Polly", subtitle: "Orchestrator — 65 messages", href: "/agents", icon: Bot },
  { id: "2", type: "agent", title: "the-researcher", subtitle: "Research — 89 messages", href: "/agents", icon: Bot },
  { id: "3", type: "project", title: "Aleph Bees", subtitle: "75% complete — 12/16 tasks", href: "/projects", icon: FolderKanban },
  { id: "4", type: "project", title: "Mission Control", subtitle: "60% complete — 34/40 tasks", href: "/projects", icon: FolderKanban },
  { id: "5", type: "task", title: "Morning Brief", subtitle: "Routine — completed", href: "/tasks", icon: CheckSquare },
  { id: "6", type: "task", title: "Code Review", subtitle: "Routine — pending", href: "/tasks", icon: CheckSquare },
  { id: "7", type: "event", title: "Design Sync", subtitle: "Today 2:00 PM", href: "/calendar", icon: CalendarDays },
];

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const filtered = DEMO_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            window.location.href = results[selectedIndex].href;
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-3 border-b border-[var(--card-border)]">
          <Search className="size-4 text-[var(--muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              search(e.target.value);
            }}
            placeholder="Search agents, projects, tasks, events..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)] text-[var(--foreground)]"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}>
              <X className="size-4 text-[var(--muted)] hover:text-[var(--foreground)]" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--card-border)] bg-[var(--sidebar-bg)] text-[var(--muted)]">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-1">
              {results.map((result, i) => {
                const Icon = result.icon;
                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      i === selectedIndex
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "hover:bg-[var(--sidebar-bg)]"
                    )}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <Icon className={cn("size-4 shrink-0", i === selectedIndex ? "text-[var(--accent)]" : "text-[var(--muted)]")} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{result.title}</div>
                      <div className="text-[10px] text-[var(--muted)] truncate">{result.subtitle}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-sm text-[var(--muted)]">
              No results for "{query}"
            </div>
          ) : (
            <div className="p-4">
              <div className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">Recent</div>
              <div className="space-y-1">
                {DEMO_RESULTS.slice(0, 3).map((result) => {
                  const Icon = result.icon;
                  return (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--sidebar-bg)] transition-colors"
                    >
                      <Icon className="size-4 text-[var(--muted)] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm truncate">{result.title}</div>
                        <div className="text-[10px] text-[var(--muted)] truncate">{result.subtitle}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
