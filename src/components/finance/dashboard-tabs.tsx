import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Calendar, PieChart, TrendingUp, Sparkles, Activity } from "lucide-react";

interface DashboardTabsProps {
  overview: ReactNode;
  analytics: ReactNode;
  kids: ReactNode;
  yearly: ReactNode;
  insights: ReactNode;
  className?: string;
}

export function DashboardTabs({
  overview,
  analytics,
  kids,
  yearly,
  insights,
  className
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className={cn("w-full space-y-6", className)}>
      <div className="sticky top-[72px] z-20 bg-background/80 backdrop-blur-md pb-2 -mx-2 px-2 border-b border-border/40 sm:static sm:bg-transparent sm:pb-0 sm:border-none sm:mx-0 sm:px-0">
        <TabsList className="w-full justify-start h-12 bg-muted/40 p-1 rounded-2xl border border-border/50 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl px-4 text-[12px] font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <Activity className="size-3.5" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="rounded-xl px-4 text-[12px] font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <PieChart className="size-3.5" />
            Análises
          </TabsTrigger>
          <TabsTrigger 
            value="yearly" 
            className="rounded-xl px-4 text-[12px] font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <BarChart3 className="size-3.5" />
            Balanço Anual
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="rounded-xl px-4 text-[12px] font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <Sparkles className="size-3.5" />
            Insights
          </TabsTrigger>
          <TabsTrigger 
            value="kids" 
            className="rounded-xl px-4 text-[12px] font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap"
          >
            <TrendingUp className="size-3.5" />
            Família & Kids
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

      <TabsContent value="kids" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-200">
        {kids}
      </TabsContent>
    </Tabs>
  );
}
