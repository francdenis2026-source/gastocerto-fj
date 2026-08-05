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
        "rounded-[12px] border border-[#22C55E1F] bg-[#10241E] p-4 transition-all group/card cursor-default shadow-lg",
        onClick && "cursor-pointer hover:bg-[#142B24] hover:border-[#22C55E3D] active:scale-[0.98]",
        className
      )}
      title={hint}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black text-[#8FA39C] uppercase tracking-[0.05em]">{label}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg border border-[#22C55E1F] bg-[#22C55E0A] text-[#22C55E]">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold font-mono text-[#F5F7F6] tracking-tight tabular-nums">{value}</span>
        {trend && (
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md", 
              trendDirection === "up" ? "bg-emerald-500/10 text-[#4ADE80]" : 
              trendDirection === "down" ? "bg-rose-500/10 text-[#EF4444]" : "bg-white/5 text-[#8FA39C]"
            )}>
              {trend}
            </span>
            <span className="text-[10px] text-[#8FA39C] font-medium tracking-tight">vs mês ant.</span>
          </div>
        )}
      </div>
    </div>
  );
}
