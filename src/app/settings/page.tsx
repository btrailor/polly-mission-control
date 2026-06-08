"use client";

import { useTheme } from "@/app/theme-provider";
import { Settings, Moon, Sun, Monitor, Bell, Shield, Globe, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "linear", label: "Linear", description: "Dark, clean, modern" },
  { value: "reas", label: "Reas", description: "GitHub-inspired, technical" },
  { value: "fidenza", label: "Fidenza", description: "Purple, dense, generative" },
  { value: "ghost-box", label: "Ghost Box", description: "Minimal, sparse, archival" },
  { value: "martens", label: "Martens", description: "Light, plain, typographic" },
  { value: "jetset", label: "Jetset", description: "Swiss minimal, rigorous" },
  { value: "riley", label: "Riley", description: "Blue, structured, formal" },
  { value: "albers", label: "Albers", description: "Relational, red accent" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed } = useTheme();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Configure your dashboard experience.</p>
      </div>

      {/* Appearance */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="size-4 text-[var(--accent)]" />
          <h2 className="text-sm font-medium">Appearance</h2>
        </div>

        <div className="space-y-2">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-lg border transition-colors text-left",
                theme === t.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/30"
              )}
            >
              <div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-[var(--muted)]">{t.description}</div>
              </div>
              {theme === t.value && (
                <div className="size-2 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="size-4 text-[var(--accent)]" />
          <h2 className="text-sm font-medium">Layout</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
            <div>
              <div className="text-sm font-medium">Sidebar collapsed by default</div>
              <div className="text-xs text-[var(--muted)]">Start with icon-only sidebar</div>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                sidebarCollapsed ? "bg-[var(--accent)]" : "bg-[var(--sidebar-border)]"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                  sidebarCollapsed ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-4 text-[var(--accent)]" />
          <h2 className="text-sm font-medium">Notifications</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: "Budget alerts", description: "Warn when daily cost exceeds 80%" },
            { label: "Agent errors", description: "Notify when agents fail" },
            { label: "Daily brief", description: "Morning summary at 8am" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-[var(--muted)]">{item.description}</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-[var(--accent)] relative">
                <div className="absolute top-0.5 right-0.5 size-4 rounded-full bg-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-[var(--accent)]" />
          <h2 className="text-sm font-medium">System</h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
            <div className="text-sm">Version</div>
            <div className="text-xs text-[var(--muted)]">v1.0.0</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
            <div className="text-sm">Build</div>
            <div className="text-xs text-[var(--muted)]">2026.06.08</div>
          </div>
        </div>
      </div>
    </div>
  );
}
