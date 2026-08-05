import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  Zap, 
  BarChart3,
  Calendar
} from "lucide-react";

interface DashboardTabsProps {
  resumo: ReactNode;
  categorias: ReactNode;
  evolucao: ReactNode;
  proximasAcoes: ReactNode;
  className?: string;
}

export function DashboardTabs({
  resumo,
  categorias,
  evolucao,
  proximasAcoes,
  className
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="resumo" className={cn("w-full space-y-6", className)}>
      <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
        <TabsList className="bg-[#10241E] border border-emerald-500/10 h-11 p-1 rounded-xl">
          <TabsTrigger 
            value="resumo" 
            className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2"
          >
            <LayoutDashboard className="size-3.5" />
            Resumo
          </TabsTrigger>
          <TabsTrigger 
            value="categorias" 
            className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2"
          >
            <PieChart className="size-3.5" />
            Categorias
          </TabsTrigger>
          <TabsTrigger 
            value="evolucao" 
            className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2"
          >
            <TrendingUp className="size-3.5" />
            Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="proximas" 
            className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2"
          >
            <Zap className="size-3.5" />
            Próximas ações
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-200">
        <TabsContent value="resumo" className="mt-0 focus-visible:ring-0">
          {resumo}
        </TabsContent>
        <TabsContent value="categorias" className="mt-0 focus-visible:ring-0">
          {categorias}
        </TabsContent>
        <TabsContent value="evolucao" className="mt-0 focus-visible:ring-0">
          {evolucao}
        </TabsContent>
        <TabsContent value="proximas" className="mt-0 focus-visible:ring-0">
          {proximasAcoes}
        </TabsContent>
      </div>
    </Tabs>
  );
}
