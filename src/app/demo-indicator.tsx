"use client";

import { useState, useEffect } from "react";
import { Zap, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoIndicator() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("polly-settings");
      if (raw) {
        const settings = JSON.parse(raw);
        // Show demo indicator when no API URL is set OR demo mode is explicitly on
        setIsDemo(!settings.apiBase || settings.demoMode !== false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
    }
  }, []);

  if (!isDemo) return null;

  return (
    <div
      className={cn(
        "fixed bottom-3 right-3 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
        "bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm",
        "text-[10px] text-[var(--muted)]"
      )}
      title="Dashboard is using demo data. Configure API URL in Settings to connect to live data."
    >
      <WifiOff className="size-3 text-amber-400" />
      <span>Demo</span>
    </div>
  );
}
