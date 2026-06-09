"use client";

import { useTheme } from "./theme-provider";
import { Search, Bell, HelpCircle } from "lucide-react";
import { SearchOverlay } from "./search-overlay";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const themes = [
  { value: "linear", label: "Linear" },
  { value: "reas", label: "Reas" },
  { value: "fidenza", label: "Fidenza" },
  { value: "ghost-box", label: "Ghost Box" },
  { value: "martens", label: "Martens" },
  { value: "jetset", label: "Jetset" },
  { value: "riley", label: "Riley" },
  { value: "albers", label: "Albers" },
];

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const pathname = usePathname();

  // Keyboard shortcut: / to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setSearchOverlayOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex items-center h-12 px-4 border-b border-[var(--sidebar-border)] bg-[var(--background)]">
        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center text-sm text-[var(--muted)]">
          <span>Polly</span>
          <span className="mx-2">/</span>
          <span className="text-[var(--foreground)]">{pathname === "/" ? "Dashboard" : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}</span>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative mr-4">
          <button
            onClick={() => setSearchOverlayOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-colors"
          >
            <Search className="size-3.5" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline-flex ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--card-border)] bg-[var(--sidebar-bg)]">/</kbd>
          </button>
        </div>

        {/* Theme Switcher */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className={cn(
            "h-8 px-2 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] text-sm",
            "text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]",
            "cursor-pointer mr-3 hidden sm:block"
          )}
        >
          {themes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Help */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }))}
          className="hidden sm:flex items-center justify-center size-8 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors mr-2"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="size-4" />
        </button>

        {/* Notification */}
        <button className="relative p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors mr-3">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[var(--accent)]" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center justify-center size-7 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-medium">
          BG
        </div>
      </header>

      <SearchOverlay isOpen={searchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} />
    </>
  );
}
