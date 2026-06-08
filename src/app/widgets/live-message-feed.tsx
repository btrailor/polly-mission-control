"use client";

import { usePolling } from "@/lib/use-polling";
import { useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  agent: string;
  content: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "success";
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function LiveMessageFeedWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d: Message[]) => {
        setMessages(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  usePolling(fetchMessages, { interval: 30000 });

  const recent = messages.slice(0, 5);

  const typeColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-500";
      case "warn": return "bg-amber-500";
      case "success": return "bg-emerald-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <>
      <WidgetCard title="Live Messages" icon={MessageSquare} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-2">
          {recent.length === 0 && !loading ? (
            <div className="text-xs text-[var(--muted)]">No messages</div>
          ) : (
            recent.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <div className={cn("mt-1 size-1.5 rounded-full shrink-0", typeColor(msg.type))} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[var(--foreground)]">{msg.agent}</span>
                    <span className="text-[10px] text-[var(--muted)]">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">{msg.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Live Messages — Full Feed">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5 p-2 rounded-md bg-[var(--sidebar-bg)]">
              <div className={cn("mt-0.5 size-2 rounded-full shrink-0", typeColor(msg.type))} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{msg.agent}</span>
                  <span className="text-[10px] text-[var(--muted)]">{formatTime(msg.timestamp)}</span>
                  <span className={cn("text-[9px] px-1 rounded", msg.type === "error" && "bg-red-500/20 text-red-400", msg.type === "warn" && "bg-amber-500/20 text-amber-400", msg.type === "success" && "bg-emerald-500/20 text-emerald-400", msg.type === "info" && "bg-blue-500/20 text-blue-400")}>
                    {msg.type}
                  </span>
                </div>
                <div className="text-sm text-[var(--foreground)] mt-0.5">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      </WidgetDetail>
    </>
  );
}
