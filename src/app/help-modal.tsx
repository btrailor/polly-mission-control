"use client";

import { useState, useEffect } from "react";
import { X, Keyboard, Search, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { key: "/", description: "Search", icon: Search },
  { key: "?", description: "Keyboard shortcuts", icon: HelpCircle },
  { key: "Escape", description: "Close modal / menu", icon: X },
  { key: "n", description: "New task", icon: ArrowRight },
  { key: "g", description: "Go to...", icon: ArrowRight },
] as const;

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Keyboard className="size-4 text-[var(--accent)]" />
            <span className="font-medium">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--sidebar-bg)]/40"
              >
                <div className="flex items-center gap-3">
                  <shortcut.icon className="size-4 text-[var(--muted)]" />
                  <span className="text-sm">{shortcut.description}</span>
                </div>
                <kbd className={cn(
                  "px-2 py-1 rounded-md text-xs font-mono border",
                  "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]"
                )}>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[var(--muted)] mt-4 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded border bg-[var(--card-bg)] border-[var(--card-border)]">?</kbd> anywhere to show this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
