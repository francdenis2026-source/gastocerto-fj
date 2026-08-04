import { useQuery } from "@tanstack/react-query";
import { Search, ScrollText, User, Calendar, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export function AuditLogsTable({ globalSearch = "" }: { globalSearch?: string }) {
  const [search, setSearch] = useState("");
  
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select(`
          *,
          actor:profiles!admin_logs_actor_id_fkey(full_name),
          target:profiles!admin_logs_target_user_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const filtered = useMemo(() => {
    const term = (globalSearch || search).toLowerCase();
    if (!term) return logs ?? [];
    return (logs ?? []).filter(log => {
      const action = (log.action || "").toLowerCase();
      const actor = (log.actor?.full_name || "").toLowerCase();
      const target = (log.target?.full_name || "").toLowerCase();
      const details = JSON.stringify(log.details || "").toLowerCase();
      return action.includes(term) || actor.includes(term) || target.includes(term) || details.includes(term);
    });
  }, [logs, search, globalSearch]);

  const actionLabels: Record<string, { label: string; color: string }> = {
    set_status: { label: "Alterar Status", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    grant_role: { label: "Conceder Papel", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    revoke_role: { label: "Remover Papel", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    reset_password: { label: "Reset Senha", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    delete_user: { label: "Excluir Conta", color: "bg-rose-600 text-white" },
    promote: { label: "Promover Pago", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    grant_trial: { label: "Conceder Teste", color: "bg-brand/10 text-brand border-brand/20" },
    create_user: { label: "Criar Usuário", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
    generate_code: { label: "Gerar Código", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    verify_code: { label: "Validar Código", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ScrollText className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Trilha de Auditoria</h2>
            <p className="text-xs text-muted-foreground">Registro de ações administrativas</p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Filtrar logs..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="h-9 pl-9" 
          />
        </div>
      </header>

      <div className="divide-y divide-border/50">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Carregando logs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhum log encontrado.</div>
        ) : (
          filtered.map((log) => {
            const config = actionLabels[log.action] || { label: log.action, color: "bg-slate-500/10 text-slate-600" };
            return (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <div className="w-32 shrink-0 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {formatDateTime(log.created_at)}
                </div>
                
                <div className="w-32 shrink-0">
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <User className="size-3 text-brand" />
                      {log.actor?.full_name || "Sistema"}
                    </span>
                    <span className="text-muted-foreground">realizou em</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <User className="size-3 text-amber-500" />
                      {log.target?.full_name || "—"}
                    </span>
                  </div>
                  {log.details && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground bg-muted/30 p-1.5 rounded border border-border/50">
                      <Info className="size-3 mt-0.5 shrink-0" />
                      <pre className="whitespace-pre-wrap font-sans">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
