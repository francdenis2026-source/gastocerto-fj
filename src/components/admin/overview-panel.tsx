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
} from "lucide-react";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

import { StatTile } from "@/components/finance/stat-tile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { adminOverview } from "@/lib/admin.functions";
import { formatDateTime, formatCurrency } from "@/lib/format-utils";

/** Visão geral da operação: indicadores, atalhos e últimas ações da equipe. */
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
    enabled: isAdmin, // Apenas admins podem ver a trilha global
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("id, action, created_at, details")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) {
        console.error("[admin] falha ao buscar logs recentes:", error);
        throw error;
      }
      return data ?? [];
    },
  });

  const shortcuts = [
    { id: "users", label: "Contas e usuários", icon: Users },
    { id: "financial", label: "Adm. Financeiro", icon: TrendingUp },
    { id: "temporary", label: "Acessos Temporários", icon: Gift },
    { id: "temporary", label: "Licenças e códigos", icon: ShieldCheck },
    { id: "operations", label: "Fila de suporte", icon: LifeBuoy },
    { id: "financial", label: "Vendas e pagamentos", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand/20 bg-brand/5 backdrop-blur-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand border border-brand/20 shadow-sm">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand">Central de Comando GastoCerto</h3>
            <p className="text-[11px] text-muted-foreground italic">"Decisões orientadas a dados para o sucesso da plataforma."</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => onNavigate("financial")} className="gap-2">
             <TrendingUp className="size-4" /> Relatórios
           </Button>
        </div>
      </div>

      <div className="grid gap-3 auto-cards-sm">
        <StatTile 
          tone="brand" 
          label="Usuários" 
          value={String(overview.data?.totalUsers ?? 0)} 
          icon={Users} 
          onClick={() => onNavigate("users")}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        />
        <StatTile
          tone="success"
          label="Contas ativas"
          value={String(overview.data?.activeUsers ?? 0)}
          icon={ShieldCheck}
          onClick={() => onNavigate("users")}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        />
        <StatTile
          tone="warning"
          label="Novos (30 dias)"
          value={String(overview.data?.newUsers30d ?? 0)}
          icon={TrendingUp}
          onClick={() => onNavigate("financial")}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        />
        <StatTile
          tone="neutral"
          label="Lançamentos (30 dias)"
          value={String(overview.data?.totalTransactions ?? 0)}
          icon={Database}
          onClick={() => onNavigate("financial")}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InteractiveCard
          id="admin-recent-activities"
          title="Atividades Recentes"
          description="Log de ações administrativas"
          icon={<Activity className="size-4" />}
          items={logs.data ?? []}
          maxVisibleItems={5}
          renderItem={(log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted/20 text-[11px] hover:bg-muted/40 transition-colors">
              <span className="truncate font-medium">{log.action}</span>
              <span className="shrink-0 text-muted-foreground">{formatDateTime(log.created_at)}</span>
            </div>
          )}
        >
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-[10px] text-amber-600 leading-relaxed font-medium">
              Ações críticas exigem autenticação adicional. Verifique a trilha de auditoria completa para detalhes técnicos.
            </p>
          </div>
        </InteractiveCard>

        <InteractiveCard
          id="admin-growth-metrics"
          title="Métricas de Crescimento"
          description="Evolução de novos usuários (últimos 30 dias)"
          icon={<TrendingUp className="size-4" />}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Semana 1', users: 12 },
                { name: 'Semana 2', users: 19 },
                { name: 'Semana 3', users: 15 },
                { name: 'Semana 4', users: 24 },
              ]}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '10px', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                  {[0, 1, 2, 3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? 'hsl(var(--brand))' : 'hsl(var(--brand)/0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        >
          <div className="space-y-3">
             <div className="flex items-center justify-between text-xs">
               <span className="text-muted-foreground font-medium">Meta de Conversão</span>
               <span className="font-bold text-brand">85%</span>
             </div>
             <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
               <div className="h-full w-[85%] bg-brand" />
             </div>
             <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg bg-muted/50 p-2 text-center border border-border/10">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">LTV Médio</p>
                  <p className="text-sm font-bold">{formatCurrency(149.90)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center border border-border/10">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">Churn</p>
                  <p className="text-sm font-bold text-destructive">2.4%</p>
                </div>
             </div>
          </div>
        </InteractiveCard>
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Atalhos de operação
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              variant="outline"
              className="h-auto justify-start gap-2 py-3 cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all"
              onClick={() => onNavigate(shortcut.id)}
            >
              <shortcut.icon className="size-4 text-brand" />
              <span className="text-sm">{shortcut.label}</span>
              <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </section>

      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-brand uppercase tracking-wider">Manutenção Programada</h4>
          <p className="text-[10px] text-muted-foreground">Próxima limpeza automática da lixeira: <strong>Hoje às 23:59</strong></p>
        </div>
        <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold uppercase gap-2" onClick={() => onNavigate("operations")}>
          Ver Logs <ArrowUpRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
