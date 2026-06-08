"use client";

import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WidgetCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  onExpand?: () => void;
}

export function WidgetCard({ title, icon: Icon, children, className, loading, onExpand }: WidgetCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]",
        "transition-all duration-200 hover:border-[var(--accent)]/30 hover:shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-9 px-3 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-[var(--muted)]" />
          <span className="text-xs font-medium text-[var(--foreground)]">{title}</span>
          {loading && (
            <div className="size-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          )}
        </div>
        {onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-bg)] transition-all"
            title="Expand"
          >
            <Maximize2 className="size-3" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
