import { useQuery } from "@tanstack/react-query";
import { ScrollText, ShieldAlert, TrendingUp, UserMinus, ShieldCheck, History, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { adminListAuditLogs } from "@/lib/audit-logs.functions";

const ACTION_MAP: Record<string, { label: string; icon: any; color: string }> = {
  set_status: { label: "Status alterado", icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10" },
  grant_role: { label: "Papel concedido", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10" },
  revoke_role: { label: "Papel removido", icon: UserMinus, color: "text-rose-500 bg-rose-500/10" },
  promote: { label: "Promovido a Pago", icon: TrendingUp, color: "text-purple-500 bg-purple-500/10" },
  grant_trial: { label: "Teste liberado", icon: History, color: "text-brand bg-brand/10" },
  delete_user: { label: "Conta excluída", icon: UserMinus, color: "text-white bg-rose-600" },
  update_user: { label: "Dados atualizados", icon: Info, color: "text-blue-500 bg-blue-500/10" },
};

export function UserAuditTimeline({ targetUserId }: { targetUserId: string }) {
  const listLogs = useServerFn(adminListAuditLogs);
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin", "user-logs", targetUserId],
    queryFn: async () => {
      const result = await listLogs({ data: { limit: 200 } });
      const names = new Map(result.people.map((person) => [person.user_id, person.full_name]));
      return result.logs
        .filter((log) => log.target_user_id === targetUserId)
        .slice(0, 20)
        .map((log) => ({
          ...log,
          actor: { full_name: log.actor_id ? names.get(log.actor_id) ?? null : null },
        }));
    },
  });

  if (isLoading) return <div className="text-center py-4 text-xs text-muted-foreground animate-pulse">Carregando histórico...</div>;
  if (!logs?.length) return null;

  return (
    <section className="mt-4 pt-4 border-t border-border/50">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
        <ScrollText className="size-3" />
        Linha do Tempo de Auditoria
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
        {logs.map((log) => {
          const config = ACTION_MAP[log.action] || { label: log.action, icon: Info, color: "text-slate-500 bg-slate-500/10" };
          const Icon = config.icon;
          
          return (
            <div key={log.id} className="relative pl-8 transition-all group hover:translate-x-0.5">
              <div className={cn(
                "absolute left-0 top-0 mt-0.5 flex size-5 items-center justify-center rounded-full ring-4 ring-background",
                config.color
              )}>
                <Icon className="size-2.5" />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{config.label}</span>
                  <time className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </time>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Por <span className="text-foreground font-semibold">{log.actor?.full_name || "Sistema"}</span>
                </p>
                
                {log.details && (
                  <div className="mt-1.5 text-[9px] font-medium bg-muted/40 p-2 rounded-lg border border-border/30 text-muted-foreground group-hover:bg-muted/60 transition-colors">
                    <code className="block truncate leading-relaxed">
                      {typeof log.details === 'object' 
                        ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(" | ")
                        : String(log.details)}
                    </code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
