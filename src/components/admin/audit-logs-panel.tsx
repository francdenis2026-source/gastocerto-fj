import { useQuery } from "@tanstack/react-query";
import { Search, ScrollText, User, Calendar, Info, Trash2, Loader2, ChevronDown, FilterX, ChevronLeft, ChevronRight, Eye, Clock, ShieldCheck as ShieldInfo, FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format-utils";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminPurgeLogs } from "@/lib/admin-ops.functions";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { adminListAuditLogs, adminExportAuditLogsCsv } from "@/lib/audit-logs.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AuditLogsTable({ globalSearch = "" }: { globalSearch?: string }) {
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const purgeLogs = useServerFn(adminPurgeLogs);
  const listLogs = useServerFn(adminListAuditLogs);
  const exportCsv = useServerFn(adminExportAuditLogsCsv);
  const [isExporting, setIsExporting] = useState(false);

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
      title: all ? "EXCLUIR TUDO?" : "LIMPAR ANTIGOS?",
      description: all 
        ? "Esta ação excluirá permanentemente TODOS os registros de auditoria do sistema. Para confirmar, digite EXCLUIR no campo abaixo."
        : "Isso removerá permanentemente os logs de auditoria com mais de 30 dias.",
      type: "warning",
      confirmLabel: all ? "EXCLUIR DEFINITIVAMENTE" : "LIMPAR AGORA",
      input: all ? {
        label: "Digite EXCLUIR para confirmar",
        placeholder: "EXCLUIR",
        expected: "EXCLUIR"
      } : undefined,
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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportCsv({ data: { search: (globalSearch || search).trim() } });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Logs exportados com sucesso!");
    } catch (err) {
      toast.error("Falha ao exportar logs.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const { data: result, isLoading } = useQuery({
    queryKey: ["admin", "logs", page, search, globalSearch], // Adicionada dependência de busca para permitir paginação filtrada
    queryFn: async () => {
      const searchTerm = (globalSearch || search).trim();
      const res = await listLogs({ data: { page, pageSize, search: searchTerm } });
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
    return logs ?? []; // A filtragem agora é feita no servidor via useQuery
  }, [logs]);

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
    purge_logs: { label: "Limpeza de Logs", color: "bg-red-500/10 text-red-600 border-red-500/20" },
    export_csv: { label: "Exportação CSV", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-[10px] text-brand hover:bg-brand/5 border-brand/20"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="size-3 animate-spin" /> : <FileSpreadsheet className="size-3" />}
              <span className="hidden sm:inline">Exportar CSV</span>
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
                <div key={log.id} className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs hover:bg-muted/5 transition-colors group relative">
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-7 text-muted-foreground hover:text-brand"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
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

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-brand">
              <ScrollText className="size-5" />
              Detalhes do Log de Auditoria
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre a ação executada no sistema.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="size-3" />
                    Data e Hora
                  </div>
                  <div className="text-sm font-medium">{formatDateTime(selectedLog.created_at)}</div>
                </div>

                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <ShieldInfo className="size-3" />
                    Ação Executada
                  </div>
                  <div>
                    <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border-none", actionLabels[selectedLog.action]?.color)}>
                      {actionLabels[selectedLog.action]?.label || selectedLog.action}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="size-3 text-brand" />
                    Executor (Ator)
                  </div>
                  <div className="text-sm font-medium">{selectedLog.actor?.full_name || "Sistema"}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{selectedLog.actor_id || "internal-process"}</div>
                </div>

                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="size-3 text-amber-500" />
                    Alvo (Usuário Afetado)
                  </div>
                  <div className="text-sm font-medium">{selectedLog.target?.full_name || "—"}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{selectedLog.target_user_id || "—"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Info className="size-3" />
                  Detalhes Técnicos (JSON)
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-border/40 font-mono text-[11px] leading-relaxed max-h-[250px] overflow-auto">
                  <pre className="text-brand-foreground/80">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
