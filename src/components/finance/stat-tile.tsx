import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  brand: {
    ring: "border-primary/20",
    glow: "rgba(16, 185, 129, 0.05)",
    icon: "border-primary/20 bg-primary/10 text-primary",
    value: "text-primary font-bold",
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
        "relative w-full overflow-hidden premium-card text-left p-6",
        t.ring,
        onClick ? "active:scale-[0.98]" : "hover:translate-y-0",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${t.glow}, transparent 70%)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl border transition-colors", t.icon)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      <p
        title={value}
        className={cn(
          "mt-4 truncate font-sans text-3xl lg:text-4xl font-extrabold leading-none tabular tracking-tight",
          t.value,
        )}
      >
        {value}
      </p>
      {hint ? (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
          {hint}
        </div>
      ) : null}
      {badge ? <div className="mt-4">{badge}</div> : null}
      {typeof progress === "number" ? (
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary/50">
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", t.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </Comp>
  );
}
