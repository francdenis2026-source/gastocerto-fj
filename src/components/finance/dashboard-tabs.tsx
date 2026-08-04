import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, PieChart, TrendingUp, Sparkles, Activity, Baby } from "lucide-react";

interface DashboardTabsProps {
  overview: ReactNode;
  analytics: ReactNode;
  kids: ReactNode;
  yearly: ReactNode;
  insights: ReactNode;
  recommendations: ReactNode;
  className?: string;
}

export function DashboardTabs({
  overview,
  analytics,
  kids,
  yearly,
  insights,
  recommendations,
  className
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className={cn("w-full space-y-6", className)}>
      <div className="sticky top-[56px] z-30 bg-background/95 backdrop-blur-md pb-1 -mx-3 px-3 border-b border-border/40 sm:static sm:bg-transparent sm:pb-0 sm:border-none sm:mx-0 sm:px-0">
        <TabsList className="w-full justify-start h-10 bg-muted/40 p-0.5 rounded-xl border border-border/50 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap">
          <TabsTrigger 
            value="overview" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <Activity className="size-3.5 sm:size-4" />
            Resumo
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <PieChart className="size-3.5 sm:size-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger 
            value="yearly" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <BarChart3 className="size-3.5 sm:size-4" />
            Anual
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <Sparkles className="size-3.5 sm:size-4" />
            IA
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <TrendingUp className="size-3.5 sm:size-4" />
            Dicas
          </TabsTrigger>
          <TabsTrigger 
            value="kids" 
            className="rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-[13.5px] font-bold gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <Baby className="size-3.5 sm:size-4" />
            Kids
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {overview}
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {analytics}
      </TabsContent>

      <TabsContent value="yearly" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {yearly}
      </TabsContent>

      <TabsContent value="insights" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {insights}
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {recommendations}
      </TabsContent>

      <TabsContent value="kids" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {kids}
      </TabsContent>
    </Tabs>
  );
}
