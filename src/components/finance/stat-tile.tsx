import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  brand: {
    ring: "border-primary/25",
    glow: "color-mix(in oklab, var(--primary) 14%, transparent)",
    icon: "border-primary/25 bg-primary/10 text-primary",
    value: "text-foreground",
    bar: "bg-primary",
  },
  success: {
    ring: "border-emerald-500/25",
    glow: "oklch(0.72 0.16 155 / 10%)",
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  expense: {
    ring: "border-rose-500/30",
    glow: "oklch(0.68 0.18 25 / 8%)",
    icon: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    value: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
  },
  warning: {
    ring: "border-amber-500/30",
    glow: "oklch(0.78 0.16 80 / 10%)",
    icon: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  neutral: {
    ring: "border-border",
    glow: "color-mix(in oklab, var(--foreground) 5%, transparent)",
    icon: "border-border bg-muted text-muted-foreground",
    value: "text-foreground",
    bar: "bg-muted-foreground",
  },
} as const;

export type StatTone = keyof typeof tones;

type StatTileProps = {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: StatTone;
  progress?: number;
  badge?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  progress,
  badge,
  onClick,
  className,
}: StatTileProps) {
  const t = tones[tone];
  const Comp = onClick ? "button" : "div";
  const normalizedProgress =
    typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-soft transition-[transform,box-shadow,border-color,background-color] sm:p-5",
        t.ring,
        onClick &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${t.glow}, transparent 62%)` }}
      aria-label={onClick ? `${label}: ${value}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[10px] font-semibold uppercase leading-snug tracking-[0.09em] text-muted-foreground sm:text-[11px]">
          {label}
        </p>
        {Icon ? (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl border", t.icon)}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-2 break-words font-display text-[clamp(1.05rem,5vw,1.45rem)] font-bold leading-tight tracking-tight tabular-nums",
          t.value,
        )}
      >
        {value}
      </p>

      {hint ? <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</div> : null}
      {badge ? <div className="mt-2.5">{badge}</div> : null}

      {typeof normalizedProgress === "number" ? (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(normalizedProgress)}
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-300", t.bar)}
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      ) : null}
    </Comp>
  );
}
