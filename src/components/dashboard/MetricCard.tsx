import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  brand: {
    ring: "border-emerald-500/20",
    glow: "oklch(0.52 0.15 150 / 8%)",
    icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    value: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  neutral: {
    ring: "border-white/5",
    glow: "white/5",
    icon: "border-white/10 bg-white/5 text-slate-300",
    value: "text-white",
    bar: "bg-slate-700",
  },
  expense: {
    ring: "border-rose-500/20",
    glow: "oklch(0.68 0.18 25 / 6%)",
    icon: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    value: "text-rose-500",
    bar: "bg-rose-500",
  },
  warning: {
    ring: "border-amber-500/20",
    glow: "oklch(0.8 0.15 80 / 6%)",
    icon: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    value: "text-amber-500",
    bar: "bg-amber-500",
  },
} as const;

export type StatTone = keyof typeof tones;

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  tone?: StatTone;
  progress?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  tone = "neutral",
  progress,
  className,
}: MetricCardProps) {
  const t = tones[tone];

  return (
    <div className={cn("rounded-2xl border border-white/5 bg-[#141A22] p-5 transition-all hover:bg-[#1A2028]", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn("p-2 rounded-lg border", t.icon)}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-white tracking-tight">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", 
            trendDirection === "up" ? "text-emerald-400" : 
            trendDirection === "down" ? "text-rose-400" : "text-slate-500"
          )}>
            {trend}
          </span>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
