"use client";

import { useTheme } from "./theme-provider";
import { Search, Bell, Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center h-12 px-4 border-b border-[var(--sidebar-border)] bg-[var(--background)]">
      {/* Breadcrumbs - hidden on very small screens */}
      <div className="hidden sm:flex items-center text-sm text-[var(--muted)]">
        <span>Polly</span>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Dashboard</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative mr-4">
        {/* Desktop search */}
        <div className="hidden md:block relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "h-8 w-48 lg:w-64 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] pl-8 pr-3 text-sm",
              "text-[var(--foreground)] placeholder:text-[var(--muted)]",
              "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
            )}
          />
        </div>

        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors"
        >
          {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
        </button>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-12 z-50 p-3 bg-[var(--background)] border-b border-[var(--card-border)] md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className={cn(
                "h-10 w-full rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] pl-8 pr-3 text-sm",
                "text-[var(--foreground)] placeholder:text-[var(--muted)]",
                "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
              )}
            />
          </div>
        </div>
      )}

      {/* Theme Switcher - hidden on small mobile */}
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
  );
}
