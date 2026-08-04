import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  brand: {
    ring: "border-primary/20",
    glow: "rgba(16, 185, 129, 0.05)",
    icon: "border-primary/20 bg-primary/10 text-primary",
    value: "text-foreground",
    bar: "bg-primary",
  },
  success: {
    ring: "border-primary/20",
    glow: "rgba(16, 185, 129, 0.05)",
    icon: "border-primary/20 bg-primary/10 text-primary",
    value: "text-primary",
    bar: "bg-primary",
  },
  expense: {
    ring: "border-rose-500/20",
    glow: "rgba(244, 63, 94, 0.05)",
    icon: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    value: "text-rose-500 font-bold",
    bar: "bg-rose-500",
  },
  warning: {
    ring: "border-amber-500/20",
    glow: "rgba(245, 158, 11, 0.05)",
    icon: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    value: "text-amber-500",
    bar: "bg-amber-500",
  },
  neutral: {
    ring: "border-border",
    glow: "rgba(255, 255, 255, 0.02)",
    icon: "border-border bg-muted/50 text-muted-foreground",
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
  /** 0-100: desenha uma barra de proporção no pé do cartão. */
  progress?: number;
  badge?: ReactNode;
  onClick?: () => void;
  className?: string;
};

/** Cartão de métrica com cor semântica, ícone e proporção opcional. */
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

  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "relative w-full overflow-hidden glass-morphism mobile-compact-card text-left shadow-soft transition-all hover:bg-card/80",
        t.ring,
        onClick
          ? "hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          : null,
        className,
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${t.glow}, transparent 60%)` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground sm:text-[11.5px] sm:tracking-[0.09em]">
          {label}
        </p>
        {Icon ? (
          <span className={cn("grid size-6 sm:size-7 shrink-0 place-items-center rounded-lg border", t.icon)}>
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p
        title={value}
        className={cn(
          "mt-1.5 truncate font-display text-[clamp(0.95rem,4.1vw,1.3rem)] font-bold leading-tight tabular tracking-tight",
          t.value,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">{hint}</p>
      ) : null}
      {badge ? <div className="mt-2">{badge}</div> : null}
      {typeof progress === "number" ? (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", t.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </Comp>
  );
}
