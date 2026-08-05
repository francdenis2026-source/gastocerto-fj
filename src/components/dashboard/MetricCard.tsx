import type { LucideIcon } from "lucide-react";
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
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  tone?: StatTone;
  progress?: number;
  className?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  hint?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  tone = "neutral",
  progress,
  className,
  onClick,
  badge,
  hint
}: MetricCardProps) {
  const t = tones[tone];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/5 bg-[#141A22] p-5 transition-all group/card cursor-default",
        onClick && "cursor-pointer hover:bg-[#1A2028] hover:border-white/10 active:scale-[0.98]",
        className
      )}
      title={hint}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</span>
          {badge}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-xl border transition-colors", t.icon)}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black font-mono text-white tracking-tight tabular">{value}</span>
        {trend && (
          <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/5", 
            trendDirection === "up" ? "text-emerald-400" : 
            trendDirection === "down" ? "text-rose-400" : "text-slate-500"
          )}>
            {trend}
          </span>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", t.bar)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
