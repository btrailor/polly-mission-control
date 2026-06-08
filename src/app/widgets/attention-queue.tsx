"use client";

import { useEffect, useMemo, useState } from "react";
import { WidgetCard } from "@/app/widget-card";
import { WidgetDetail } from "@/app/widget-detail";
import { AlertTriangle, AlertCircle, Info, Clock, Flame, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  domain: "infrastructure" | "agents" | "personal" | "projects";
  severity: "critical" | "high" | "medium" | "low";
  ageMinutes: number;
  source: string;
  actionable: boolean;
  action?: string;
}

interface AttentionData {
  items: AttentionItem[];
  generatedAt: string;
}

// Domain weights — how important each domain is to your operations
const DOMAIN_WEIGHTS: Record<AttentionItem["domain"], number> = {
  infrastructure: 1.5, // High: if gateway is down, everything stops
  agents: 1.2,         // Medium-high: agent failures cascade
  personal: 1.0,     // Normal: your own tasks
  projects: 0.9,       // Slightly lower: project delays are manageable
};

// Severity multipliers
const SEVERITY_MULTIPLIERS: Record<AttentionItem["severity"], number> = {
  critical: 4.0,
  high: 2.5,
  medium: 1.5,
  low: 1.0,
};

// Age decay factor — older items lose urgency
function ageFactor(ageMinutes: number): number {
  if (ageMinutes < 60) return 1.0;           // < 1 hour: full urgency
  if (ageMinutes < 240) return 0.85;       // < 4 hours: slight decay
  if (ageMinutes < 1440) return 0.7;        // < 24 hours: moderate decay
  if (ageMinutes < 10080) return 0.55;       // < 1 week: significant decay
  return 0.4;                                 // > 1 week: stale
}

// Score = Age (hours) × Severity × DomainWeight × AgeFactor
function calculateScore(item: AttentionItem): number {
  const ageHours = item.ageMinutes / 60;
  const severityMult = SEVERITY_MULTIPLIERS[item.severity];
  const domainWeight = DOMAIN_WEIGHTS[item.domain];
  const decay = ageFactor(item.ageMinutes);
  
  return ageHours * severityMult * domainWeight * decay;
}

const SEVERITY_CONFIG = {
  critical: { icon: Flame, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  high: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "High" },
  medium: { icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Medium" },
  low: { icon: Info, color: "text-[var(--muted)]", bg: "bg-[var(--sidebar-bg)]", border: "border-[var(--card-border)]", label: "Low" },
};

const DOMAIN_ICONS: Record<AttentionItem["domain"], string> = {
  infrastructure: "🖥️",
  agents: "🤖",
  personal: "👤",
  projects: "📁",
};

function formatAge(ageMinutes: number): string {
  if (ageMinutes < 60) return `${ageMinutes}m`;
  if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h`;
  return `${Math.floor(ageMinutes / 1440)}d`;
}

export function AttentionQueueWidget() {
  const [data, setData] = useState<AttentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetch("/api/attention")
      .then((r) => r.json())
      .then((d: AttentionData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        // Demo data
        setData({
          items: [
            { id: "1", title: "Gateway latency spike", description: "Response time >500ms for 15 minutes", domain: "infrastructure", severity: "critical", ageMinutes: 15, source: "system-monitor", actionable: true, action: "Restart gateway" },
            { id: "2", title: "frontend-dev agent crashed", description: "Build failed 3 times in a row", domain: "agents", severity: "high", ageMinutes: 45, source: "agent-status", actionable: true, action: "Check logs" },
            { id: "3", title: "Daily cost at 85%", description: "Budget will exceed limit in ~2 hours", domain: "infrastructure", severity: "high", ageMinutes: 120, source: "cost-tracker", actionable: false },
            { id: "4", title: "Vault sync stale", description: "Last sync was 6 hours ago", domain: "infrastructure", severity: "medium", ageMinutes: 360, source: "vault-health", actionable: true, action: "Trigger sync" },
            { id: "5", title: "Aleph Bees PR open", description: "Review requested 2 days ago", domain: "projects", severity: "medium", ageMinutes: 2880, source: "github", actionable: true, action: "Review PR" },
            { id: "6", title: "3 agents idle", description: "the-cartographer, image-creator, the-writer", domain: "agents", severity: "low", ageMinutes: 180, source: "agent-status", actionable: false },
            { id: "7", title: "Weekly report due", description: "Summary for last week not generated", domain: "personal", severity: "low", ageMinutes: 1440, source: "cron-schedule", actionable: true, action: "Generate report" },
          ],
          generatedAt: new Date().toISOString(),
        });
        setLoading(false);
      });
  }, []);

  const sortedItems = useMemo(() => {
    if (!data) return [];
    return [...data.items]
      .map((item) => ({ ...item, score: calculateScore(item) }))
      .sort((a, b) => b.score - a.score);
  }, [data]);

  const topItems = sortedItems.slice(0, 5);
  const criticalCount = sortedItems.filter((i) => i.severity === "critical").length;
  const highCount = sortedItems.filter((i) => i.severity === "high").length;

  return (
    <>
      <WidgetCard title="Attention Queue" icon={AlertTriangle} loading={loading} onExpand={() => setDetailOpen(true)}>
        <div className="space-y-2">
          {/* Summary */}
          {(criticalCount > 0 || highCount > 0) && (
            <div className="flex items-center gap-2 mb-3">
              {criticalCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {criticalCount} critical
                </span>
              )}
              {highCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {highCount} high
                </span>
              )}
            </div>
          )}

          {topItems.map((item) => {
            const config = SEVERITY_CONFIG[item.severity];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md border transition-colors",
                  config.bg,
                  config.border,
                  item.actionable && "cursor-pointer hover:bg-[var(--card-bg)]"
                )}
              >
                <Icon className={cn("size-3.5 shrink-0 mt-0.5", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{item.title}</span>
                    <span className="text-[10px] text-[var(--muted)] shrink-0">
                      {formatAge(item.ageMinutes)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </WidgetCard>

      <WidgetDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Attention Queue — Full Priority List">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Critical", count: sortedItems.filter((i) => i.severity === "critical").length, color: "text-red-400" },
              { label: "High", count: sortedItems.filter((i) => i.severity === "high").length, color: "text-amber-400" },
              { label: "Medium", count: sortedItems.filter((i) => i.severity === "medium").length, color: "text-blue-400" },
              { label: "Low", count: sortedItems.filter((i) => i.severity === "low").length, color: "text-[var(--muted)]" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
                <div className={cn("text-lg font-bold", stat.color)}>{stat.count}</div>
                <div className="text-[10px] text-[var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Full ranked list */}
          <div className="space-y-2">
            {sortedItems.map((item, index) => {
              const config = SEVERITY_CONFIG[item.severity];
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    config.bg,
                    config.border
                  )}
                >
                  <div className="flex items-center justify-center size-6 rounded-md bg-[var(--card-bg)] text-xs font-mono shrink-0">
                    {index + 1}
                  </div>

                  <Icon className={cn("size-4 shrink-0 mt-0.5", config.color)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--card-bg)] text-[var(--muted)]">
                          {DOMAIN_ICONS[item.domain]} {item.domain}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--muted)] shrink-0">
                        Score: {item.score.toFixed(1)}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--muted)] mt-0.5">{item.description}</div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatAge(item.ageMinutes)}
                      </span>
                      <span>Source: {item.source}</span>
                      {item.actionable && item.action && (
                        <button className="flex items-center gap-1 text-[var(--accent)] hover:underline">
                          {item.action}
                          <ChevronRight className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scoring formula */}
          <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)]">
            <div className="text-xs font-medium mb-2">Scoring Formula</div>
            <div className="text-[10px] text-[var(--muted)] font-mono">
              Score = Age(hours) × Severity × DomainWeight × AgeDecay
            </div>
            <div className="mt-2 space-y-1 text-[10px] text-[var(--muted)]">
              <div>Critical=4×, High=2.5×, Medium=1.5×, Low=1×</div>
              <div>Infrastructure=1.5×, Agents=1.2×, Personal=1×, Projects=0.9×</div>
              <div>Decay: &lt;1h=1.0, &lt;4h=0.85, &lt;24h=0.7, &lt;1w=0.55, &gt;1w=0.4</div>
            </div>
          </div>
        </div>
      </WidgetDetail>
    </>
  );
}
