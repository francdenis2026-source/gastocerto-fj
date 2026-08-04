import { useQuery } from "@tanstack/react-query";
import { Search, ScrollText, User, Calendar, Info, Trash2, Loader2, ChevronDown, FilterX, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminPurgeLogs } from "@/lib/admin-ops.functions";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { adminListAuditLogs } from "@/lib/audit-logs.functions";

export function AuditLogsTable({ globalSearch = "" }: { globalSearch?: string }) {
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const purgeLogs = useServerFn(adminPurgeLogs);
  const listLogs = useServerFn(adminListAuditLogs);

  const purgeMutation = useMutation({
    mutationFn: (beforeDate: string | null) => purgeLogs({ data: { beforeDate, actionType: "all" } }),
    onSuccess: (res) => {
      toast.success(`Limpeza concluída: ${res.count} logs removidos.`);
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
    },
    onError: () => toast.error("Falha ao limpar logs.")
  });

  const handlePurge = (all: boolean = false) => {
    confirm({
      title: all ? "Excluir TODOS os logs?" : "Limpar logs antigos?",
      description: all 
        ? "Esta ação excluirá permanentemente todos os registros de auditoria sem possibilidade de restauração."
        : "Isso removerá permanentemente todos os logs de auditoria com mais de 30 dias.",
      type: "destructive",
      onConfirm: () => {
        if (all) {
          purgeMutation.mutate(null);
        } else {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          purgeMutation.mutate(thirtyDaysAgo.toISOString());
        }
      }
    });
  };
  
  const { data: result, isLoading } = useQuery({
    queryKey: ["admin", "logs", page],
    queryFn: async () => {
      const res = await listLogs({ data: { page, pageSize } });
      const names = new Map(res.people.map((person) => [person.user_id, person.full_name]));
      return {
        logs: res.logs.map((log) => ({
          ...log,
          actor: { full_name: log.actor_id ? names.get(log.actor_id) ?? null : null },
          target: { full_name: log.target_user_id ? names.get(log.target_user_id) ?? null : null },
        })),
        totalPages: res.totalPages,
        count: res.count
      };
    },
  });

  const logs = result?.logs ?? [];
  const totalPages = result?.totalPages ?? 1;
  const totalCount = result?.count ?? 0;

  const filtered = useMemo(() => {
    const term = (globalSearch || search).toLowerCase();
    if (!term) return logs ?? [];
    return (logs ?? []).filter(log => {
      const action = (log.action || "").toLowerCase();
      const actor = (log.actor?.full_name || "").toLowerCase();
      const target = (log.target?.full_name || "").toLowerCase();
      const details = typeof log.details === 'object' ? Object.values(log.details || {}).join(" ").toLowerCase() : String(log.details || "").toLowerCase();
      return action.includes(term) || actor.includes(term) || target.includes(term) || details.includes(term);
    });
  }, [logs, search, globalSearch]);

  const clearFilters = () => {
    setSearch("");
    // Se houvesse outros filtros locais, seriam resetados aqui
    toast.info("Filtros limpos em tempo real", {
      icon: <FilterX className="size-4" />,
      duration: 2000
    });
  };

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
    <div className="space-y-4 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300">
      <header className="flex items-center justify-between gap-4 p-4 border-b border-border/50 bg-muted/10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 text-muted-foreground hover:bg-muted/50"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expandir" : "Recolher"}
          >
            <ChevronDown className={cn("size-4 transition-transform duration-200", isCollapsed && "-rotate-90")} />
          </Button>
          <div className="flex items-center gap-2">
            <ScrollText className="size-4 text-brand" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Trilha de Auditoria</h2>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="relative w-40 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Filtrar logs..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs border-none bg-muted/40 focus-visible:ring-1 focus-visible:ring-brand/30" 
              />
            </div>
            {search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 text-muted-foreground hover:text-brand"
                onClick={clearFilters}
                title="Limpar filtros"
              >
                <FilterX className="size-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-[10px] text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20"
              onClick={() => handlePurge(true)}
              disabled={purgeMutation.isPending}
              title="Excluir tudo"
            >
              {purgeMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              <span className="hidden sm:inline">Excluir Tudo</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-[10px] text-muted-foreground hover:bg-muted/50 border-border/40"
              onClick={() => handlePurge(false)}
              disabled={purgeMutation.isPending}
            >
              <span className="hidden sm:inline">Limpar 30d</span>
            </Button>
          </div>
        )}
        <ConfirmDialog />
      </header>

      {!isCollapsed && (
        <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted p-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Carregando registros...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Nenhum log encontrado.</div>
          ) : (
            filtered.map((log) => {
              const config = actionLabels[log.action] || { label: log.action, color: "bg-slate-500/10 text-slate-600" };
              return (
                <div key={log.id} className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs hover:bg-muted/5 transition-colors group">
                  <div className="w-28 shrink-0 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                    <Calendar className="size-3" />
                    {formatDateTime(log.created_at)}
                  </div>
                  
                  <div className="w-28 shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border-none", config.color)}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground/90 flex items-center gap-1">
                        <User className="size-3 text-brand/70" />
                        {log.actor?.full_name || "Sistema"}
                      </span>
                      <span className="text-muted-foreground/60 text-[10px] lowercase">realizou em</span>
                      <span className="font-semibold text-foreground/90 flex items-center gap-1">
                        <User className="size-3 text-amber-500/70" />
                        {log.target?.full_name || "—"}
                      </span>
                    </div>
                    {log.details && (
                      <div className="flex items-start gap-1 text-[9px] text-muted-foreground/80 bg-muted/20 px-1.5 py-0.5 rounded border border-border/20 max-w-sm">
                        <Info className="size-2.5 mt-0.5 shrink-0" />
                        <span className="truncate group-hover:whitespace-normal group-hover:break-words">
                          {typeof log.details === 'object' 
                            ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(" | ")
                            : String(log.details)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 p-4 border-t border-border/30 bg-muted/5 mt-auto">
              <span className="text-[10px] text-muted-foreground">
                Total: <strong>{totalCount}</strong> logs · Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 border-border/40"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <div className="flex items-center gap-1 px-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = totalPages <= 5 
                      ? i + 1 
                      : Math.min(Math.max(page - 2, 1), totalPages - 4) + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="icon"
                        className={cn("size-7 text-[10px]", page === pageNum ? "bg-brand" : "")}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 border-border/40"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
