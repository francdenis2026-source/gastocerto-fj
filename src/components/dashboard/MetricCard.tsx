import type { LucideIcon } from "lucide-react";
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
  badge?: React.ReactNode;
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
  hint
}: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card p-5 transition-all group/card cursor-default shadow-sm hover:shadow-md hover:border-primary/20",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      title={hint}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{label}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-[28px] font-bold font-sans text-foreground tracking-tight tabular-nums leading-tight">{value}</span>
        {trend && (
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[12px] font-bold px-2 py-0.5 rounded-full", 
              trendDirection === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
              trendDirection === "down" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground"
            )}>
              {trend}
            </span>
            <span className="text-[12px] text-[#8FA39C] font-medium tracking-tight">vs mês ant.</span>
          </div>
        )}
      </div>
    </div>
  );
}
