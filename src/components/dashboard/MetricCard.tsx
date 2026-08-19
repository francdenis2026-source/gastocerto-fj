import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
  tone?: string;
  badge?: ReactNode;
  hint?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  className,
  onClick,
  tone,
  badge,
  hint,
}: MetricCardProps) {
  const content = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase leading-tight tracking-[0.12em] text-muted-foreground">
            {label}
          </span>
          {badge ? <div className="mt-2">{badge}</div> : null}
        </div>
        {Icon ? (
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/8 text-primary", tone)}>
            <Icon className="size-5" aria-hidden />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="numeric break-words text-[clamp(1.5rem,5vw,2rem)] font-bold leading-none text-foreground">
          {value}
        </span>
        {trend ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                trendDirection === "up"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : trendDirection === "down"
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {trend}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">vs. mês anterior</span>
          </div>
        ) : null}
      </div>
    </>
  );

  const baseClass = cn(
    "min-w-0 rounded-2xl border border-border/80 bg-card p-5 text-left shadow-soft",
    onClick
      ? "cursor-pointer transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lifted active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      : "cursor-default",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(baseClass, "w-full")} title={hint} aria-label={hint ? `${label}: ${hint}` : `${label}: ${value}`}>
        {content}
      </button>
    );
  }

  return (
    <div className={baseClass} title={hint}>
      {content}
    </div>
  );
}
