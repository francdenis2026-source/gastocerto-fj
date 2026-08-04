import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Database,
  LifeBuoy,
  ShieldCheck,
  TrendingUp,
  Users,
  CreditCard,
  Target,
  FileText,
  Gift,
  Activity,
  Calendar,
  Zap,
  ArrowRight,
  BarChart3,
  Users2
} from "lucide-react";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from "recharts";

import { StatTile } from "@/components/finance/stat-tile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { adminOverview } from "@/lib/admin.functions";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminOverviewPanel({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate: (section: string) => void;
}) {
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    enabled: isAdmin,
    staleTime: 60_000,
    queryFn: () => adminOverview(),
  });

  const logs = useQuery({
    queryKey: ["admin", "logs", "recent"],
    staleTime: 60_000,
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("id, action, created_at, details")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const growthData = [
    { name: '01/08', users: 400 },
    { name: '02/08', users: 300 },
    { name: '03/08', users: 500 },
    { name: '04/08', users: 280 },
    { name: '05/08', users: 590 },
    { name: '06/08', users: 480 },
    { name: '07/08', users: 700 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPI Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatTile 
          tone="brand" 
          label="Total de Usuários" 
          value={String(overview.data?.totalUsers ?? 0)} 
          icon={Users2} 
          onClick={() => onNavigate("users")}
          className="hover:border-primary/50 transition-all border-border/40 bg-card/40"
        />
        <StatTile
          tone="success"
          label="Assinaturas Ativas"
          value={String(overview.data?.activeUsers ?? 0)}
          icon={Zap}
          onClick={() => onNavigate("financial")}
          className="hover:border-primary/50 transition-all border-border/40 bg-card/40"
        />
        <StatTile
          tone="warning"
          label="Novos (Mensal)"
          value={String(overview.data?.newUsers30d ?? 0)}
          icon={TrendingUp}
          onClick={() => onNavigate("financial")}
          className="hover:border-primary/50 transition-all border-border/40 bg-card/40"
        />
        <StatTile
          tone="neutral"
          label="Transações Totais"
          value={String(overview.data?.totalTransactions ?? 0)}
          icon={Database}
          onClick={() => onNavigate("financial")}
          className="hover:border-primary/50 transition-all border-border/40 bg-card/40"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Growth Chart - 8 cols */}
        <div className="lg:col-span-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Crescimento de Usuários</h3>
              <p className="text-sm text-muted-foreground">Volume de novos cadastros na última semana</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <TrendingUp size={20} />
              +12.5%
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17A45F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#17A45F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090B', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#17A45F' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#17A45F" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcuts - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
           <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Ações Rápidas</h3>
           <div className="grid gap-3">
              {[
                { id: "users", label: "Gestão de Usuários", icon: Users, color: "text-blue-500" },
                { id: "financial", label: "Receita e Faturamento", icon: CreditCard, color: "text-emerald-500" },
                { id: "operations", label: "Catálogo de Categorias", icon: Database, color: "text-amber-500" },
                { id: "audit", label: "Relatórios de Auditoria", icon: FileText, color: "text-purple-500" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-white/5 transition-all text-left group cursor-pointer"
                >
                  <div className={cn("size-10 rounded-lg bg-background flex items-center justify-center border border-border/50 transition-colors group-hover:border-primary/50", item.color)}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">Acessar módulo agora</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
           <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Atividade do Sistema</h3>
              <p className="text-sm text-muted-foreground">Log de operações administrativas em tempo real</p>
           </div>
           <Button variant="ghost" className="text-xs font-bold uppercase tracking-wider hover:bg-white/5" onClick={() => onNavigate("audit")}>
              Ver Logs Completos
           </Button>
        </div>
        
        <div className="space-y-2">
           {logs.data?.map((log) => (
             <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border/20 group">
                <div className="flex items-center gap-3">
                   <div className="size-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                   <span className="text-sm font-medium text-white/90">{log.action}</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[12px] text-muted-foreground font-mono">{formatDateTime(log.created_at)}</span>
                   <button className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Detalhes</button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
