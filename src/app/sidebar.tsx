"use client";

import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Users },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden flex items-center justify-center w-8 h-8 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] shadow-sm"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-all duration-300 ease-in-out z-40",
          // Desktop
          "hidden lg:flex",
          sidebarCollapsed ? "lg:w-16" : "lg:w-56",
          // Mobile
          "fixed left-0 top-0 lg:static",
          mobileOpen ? "flex w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-12 px-3 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm shrink-0">
            P
          </div>
          {!sidebarCollapsed && (
            <span className="ml-2.5 text-sm font-semibold text-[var(--foreground)] truncate">
              Mission Control
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center h-8 rounded-md text-sm transition-colors group",
                  sidebarCollapsed ? "justify-center px-0" : "px-2.5",
                  isActive
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("shrink-0", sidebarCollapsed ? "size-4" : "size-4 mr-2.5")} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-[var(--sidebar-border)]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full h-8 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <>
                <PanelLeftClose className="size-4 mr-2" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
