import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Activity, PieChart, BarChart3, Sparkles, TrendingUp, Baby, Users } from "lucide-react";

interface DashboardTabsProps {
  overview: ReactNode;
  analytics: ReactNode;
  kids: ReactNode;
  family: ReactNode;
  yearly: ReactNode;
  insights: ReactNode;
  recommendations: ReactNode;
  className?: string;
}

export function DashboardTabs({
  overview,
  analytics,
  kids,
  family,
  yearly,
  insights,
  recommendations,
  className
}: DashboardTabsProps) {
  // O menu lateral agora será a única navegação.
  // Se o usuário quiser ir para Kids ou Gráficos, deve usar a lateral.
  // Este componente será simplificado ou removido gradualmente.
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4 outline-none animate-in fade-in zoom-in-95 duration-200">
        {overview}
      </div>
    </div>
  );
}
