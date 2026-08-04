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
      <div className="sticky top-[52px] z-30 -mx-3 bg-background/95 backdrop-blur-md px-3 sm:static sm:mx-0 sm:bg-transparent sm:px-0">
        <TabsList className="flex h-10 w-full flex-nowrap justify-start overflow-x-auto overflow-y-hidden border border-border/40 bg-muted/20 p-1.5 scrollbar-none sm:h-11 sm:p-1">
          <TabsTrigger 
            value="overview" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
          >
            <Activity className="size-3.5 sm:size-4" />
            Resumo
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
          >
            <PieChart className="size-3.5 sm:size-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger 
            value="yearly" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
          >
            <BarChart3 className="size-3.5 sm:size-4" />
            Anual
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
          >
            <Sparkles className="size-3.5 sm:size-4" />
            IA
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
          >
            <TrendingUp className="size-3.5 sm:size-4" />
            Dicas
          </TabsTrigger>
          <TabsTrigger 
            value="kids" 
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-brand data-[state=active]:shadow-md sm:h-9 sm:px-6 sm:text-[13px]"
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
