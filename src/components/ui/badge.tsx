import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[var(--accent)] text-[var(--accent-foreground)]",
        variant === "secondary" && "bg-[var(--sidebar-bg)] text-[var(--muted)]",
        variant === "outline" && "border border-[var(--card-border)] text-[var(--foreground)]",
        className
      )}
    >
      {children}
    </span>
  );
}
