import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  PiggyBank, 
  TrendingUp,
  TrendingDown, 
  Gift, 
  Coins, 
  ArrowRight, 
  Plus, 
  Calendar,
  BarChart3,
  Users,
  Info,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  Edit2,
  Trash2,
  MoreVertical,
  Sparkles,
  Activity,
  Target,
  Settings,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { amountToInput } from "@/lib/money-input";
import { parseAmount } from "@/lib/finance";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { toast } from "sonner";
import { useDependents, type Dependent } from "@/lib/dependents";
import { formatCurrency } from "@/lib/format-utils";
import { KidEntryDetailsDialog } from "@/components/kids/kid-entry-details-dialog";
import { kidEntryKind, kidEntryLabel, kidEntryTone, syncStatusFor } from "@/lib/kids-labels";
import { giveMoneyToKid, getKidsFinancialMetrics } from "@/lib/kids-management.functions";
import { deleteKidManagementTransaction, updateKidManagementTransaction } from "@/lib/kids-management-actions.functions";
import { getKidGoals, saveKidGoal, deleteKidGoal, updateKidSettings } from "@/lib/kids-goals.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CHART_TOKENS, tooltipProps } from "@/lib/chart-theme";
import { useAuth } from "@/hooks/use-auth";
import { useParentKidsRealtime } from "@/lib/kids-space-realtime";
import { undoKidTransactionDeletion } from "@/lib/kids-undo.functions";
import { UNDO_WINDOW_MS, useDeletePermission } from "@/lib/undo-delete";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

export function KidsManagementPanel() {
  const { data: dependents, isLoading: loadingDeps } = useDependents();
  const kids = useMemo(() => 
    (dependents || []).filter(d => d.active !== false && !d.name.toLowerCase().includes("kessia")), 
    [dependents]
  );
  
  const [selectedKidId, setSelectedKidId] = useState<string>("all");
  const [kidDetailsOpen, setKidDetailsOpen] = useState(false);
  const [detailedKid, setDetailedKid] = useState<Dependent | null>(null);
  const [giveMoneyOpen, setGiveMoneyOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [details, setDetails] = useState<any | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Filtros do histórico (criança, tipo de movimentação e intervalo de datas)
  const [histKidId, setHistKidId] = useState<string>("all");
  const [histKind, setHistKind] = useState<string>("all");
  const [histStart, setHistStart] = useState<string>("");
  const [histEnd, setHistEnd] = useState<string>("");

  const fetchMetrics = useServerFn(getKidsFinancialMetrics);
  const runDelete = useServerFn(deleteKidManagementTransaction);
  const runUndo = useServerFn(undoKidTransactionDeletion);
  const runUpdate = useServerFn(updateKidManagementTransaction);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Gastos feitos pela criança aparecem aqui em tempo real.
  // Monitoramos o pai e todos os filhos vinculados.
  const kidUserIds = useMemo(() => kids.map(k => k.kid_user_id), [kids]);
  useParentKidsRealtime(user?.id, kidUserIds);

  const effectiveKidId = histKidId !== "all" ? histKidId : selectedKidId;
  const useRange = Boolean(histStart && histEnd);

  const metrics = useQuery({
    queryKey: ["kids_financial_metrics", effectiveKidId, histKind, histStart, histEnd, new Date().getMonth(), new Date().getFullYear(), page],
    queryFn: () => fetchMetrics({ 
      data: { 
        dependentId: effectiveKidId === "all" ? undefined : effectiveKidId,
        month: useRange ? undefined : new Date().getMonth() + 1,
        year: useRange ? undefined : new Date().getFullYear(),
        kind: histKind,
        startDate: useRange ? histStart : undefined,
        endDate: useRange ? histEnd : undefined,
        page,
        pageSize: PAGE_SIZE
      } 
    }),
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });


  const giveMoneyMutation = useMutation({
    mutationFn: useServerFn(giveMoneyToKid),
    onSuccess: (result) => {
      const transactionId = (result as { transactionId: string }).transactionId;
      const createdAt = Date.now();
      toast.success("Valor enviado com sucesso!", {
        description: "O saldo da carteira já foi atualizado.",
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Desfazer",
          onClick: () => {
            if (Date.now() - createdAt > UNDO_WINDOW_MS) {
              toast.error("O prazo para desfazer já passou.");
              return;
            }
            deleteMutation.mutate({ data: { transactionId } });
          },
        },
      });
      setGiveMoneyOpen(false);
      queryClient.invalidateQueries({ queryKey: ["kids_financial_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Invalidate notifications for kids
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar valor.");
    }
  });

  const deletePermission = useDeletePermission();
  const refreshKids = () => {
    queryClient.invalidateQueries({ queryKey: ["kids_financial_metrics"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
  };

  /** Remove/repõe a linha na hora (totais e gráficos acompanham). */
  const setOptimisticRemoved = (transactionId: string, removed: boolean) => {
    if (!removed) {
      refreshKids();
      return;
    }
    queryClient.setQueriesData<any[]>({ queryKey: ["kids_financial_metrics"] }, (current) =>
      Array.isArray(current) ? current.filter((row) => row?.id !== transactionId) : current,
    );
  };

  const undoMutation = useMutation({
    mutationFn: (vars: { data: { transactionId: string; extraIds?: string[] } }) => runUndo(vars),
    onSuccess: () => {
      toast.success("Exclusão desfeita. Totais e gráficos recalculados.");
      refreshKids();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível restaurar.");
      refreshKids();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { data: { transactionId: string } }) => runDelete(vars),
    onMutate: (variables) => {
      setOptimisticRemoved(variables.data.transactionId, true);
    },
    onSuccess: (result: any, variables) => {
      const deletedId = variables.data.transactionId;
      const deletedAt = Date.now();
      const extraIds: string[] = (result?.ids ?? []).filter((id: string) => id !== deletedId);

      toast("Lançamento removido", {
        description: "Você pode desfazer esta exclusão em até 10 minutos.",
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Desfazer",
          onClick: () => {
            if (Date.now() - deletedAt > UNDO_WINDOW_MS) {
              toast.error("O prazo de 10 minutos para desfazer já passou.");
              return;
            }
            undoMutation.mutate({ data: { transactionId: deletedId, extraIds } });
          },
        },
      });

      refreshKids();
      setKidDetailsOpen(false);
    },
    onError: (error, variables) => {
      // Rollback automático: nada muda na tela se o backend recusar.
      setOptimisticRemoved(variables.data.transactionId, false);
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir. Nada foi alterado.",
      );
    },
  });

  /** Exclusão com verificação de permissão e mensagem clara. */
  const requestKidDelete = (transactionId: string) => {
    if (!deletePermission.allowed) {
      toast.error("Exclusão não permitida", { description: deletePermission.reason ?? undefined });
      return;
    }
    deleteMutation.mutate({ data: { transactionId } });
  };

  const updateMutation = useMutation({
    mutationFn: (vars: {
      data: { transactionId: string; amount: number; description: string; transactionDate?: string };
    }) => runUpdate(vars),
    onSuccess: () => {
      toast.success("Lançamento atualizado.");
      refreshKids();
      setKidDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    },
  });


  const chartData = useMemo(() => {
    const data = metrics.data?.transactions;
    if (!data) return [];
    
    // Group by month/year
    const grouped: Record<string, number> = {};
    data.forEach((tx: any) => {
      const date = new Date(tx.transaction_date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      grouped[key] = (grouped[key] || 0) + tx.amount;
    });

    return Object.entries(grouped).map(([name, total]) => ({ name, total }))
      .sort((a, b) => {
        const [mA, yA] = a.name.split("/").map(Number);
        const [mB, yB] = b.name.split("/").map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      }).slice(-6);
  }, [metrics.data]);

  const stats = useMemo(() => {
    const data = metrics.data?.transactions;
    if (!data) return { totalSent: 0, totalKidSpent: 0, byType: { cash: 0, pix: 0, gift: 0, value: 0 }, count: 0 };
    
    let totalSent = 0;
    let totalKidSpent = 0;
    const byType = { cash: 0, pix: 0, gift: 0, value: 0 };
    
    data.forEach((tx: any) => {
      const isKidSelf = tx.tags?.includes("kid_self_expense");
      
      if (isKidSelf) {
        if (tx.transaction_type === "expense") totalKidSpent += tx.amount;
      } else {
        // Envio do pai (sempre despesa para o pai, entrada para o filho)
        totalSent += tx.amount;
        const typeTag = (tx.tags || []).find((t: string) => t.startsWith("type:"));
        if (typeTag) {
          const type = typeTag.split(":")[1] as keyof typeof byType;
          if (byType[type] !== undefined) byType[type] += tx.amount;
        }
      }
    });

    return { totalSent, totalKidSpent, byType, count: data.length };
  }, [metrics.data]);

  if (loadingDeps) return <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (kids.length === 0) return null;

  return (
    <Card className="rounded-xl border-border/40 shadow-sm overflow-hidden bg-card">
      <CardHeader className="py-2.5 px-3 border-b border-border/50 bg-muted/20 sm:py-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <PiggyBank className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Gestão do Espaço Kid</CardTitle>
              <CardDescription className="text-[11px]">Envie valores e acompanhe os gastos com os filhos</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Select value={selectedKidId} onValueChange={setSelectedKidId}>
              <SelectTrigger className="w-32 h-7 text-[10px] bg-background sm:w-40 sm:h-8 sm:text-[11px]">
                <Users className="size-3 mr-1 opacity-50" />
                <SelectValue placeholder="Filho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os filhos</SelectItem>
                {kids.map(kid => (
                  <SelectItem key={kid.id} value={kid.id}>{kid.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={kidDetailsOpen} onOpenChange={setKidDetailsOpen}>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-[10px] font-bold gap-1 sm:h-8 sm:px-3 sm:gap-1.5"
                disabled={selectedKidId === "all"}
                onClick={() => {
                  const kid = kids.find(k => k.id === selectedKidId);
                  if (kid) {
                    setDetailedKid(kid);
                    setKidDetailsOpen(true);
                  }
                }}
              >
                <FileText className="size-3" /> Detalhes
              </Button>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {detailedKid && (
                  <div className="space-y-6">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Avatar className="size-8 border ring-2 ring-primary/20">
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {detailedKid.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        Gastos de {detailedKid.name}
                      </DialogTitle>
                      <DialogDescription>
                        Histórico completo de envios e gastos no Espaço Kids.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                       <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                         <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Recebido</p>
                         <p className="text-lg font-black">{formatCurrency(metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'income' && !t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0)}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                         <p className="text-[9px] font-bold uppercase text-rose-600 mb-1">Gastos</p>
                         <p className="text-lg font-black">{formatCurrency(metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'expense' && t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0)}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                         <p className="text-[9px] font-bold uppercase text-primary mb-1">Saldo Atual</p>
                         <p className="text-lg font-black text-primary">
                           {formatCurrency(
                             (metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'income' && !t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0) - 
                             (metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'expense' && t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0)
                           )}
                         </p>
                       </div>
                       <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                         <p className="text-[9px] font-bold uppercase text-amber-600 mb-1">Uso do Saldo</p>
                         <p className="text-lg font-black text-amber-600">
                           {Math.min(100, Math.round(((metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'expense' && t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0) / 
                            (Math.max(1, metrics.data?.transactions?.filter((t: any) => t.transaction_type === 'income' && !t.tags?.includes("kid_self_expense")).reduce((a: number, b: any) => a + b.amount, 0) || 0))) * 100))}%
                         </p>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Monitoramento em Tempo Real</Label>
                        {metrics.isFetching && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                      </div>
                      <div className="divide-y border rounded-xl overflow-hidden bg-background/50">
                        {metrics.data?.transactions?.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            <p className="text-xs">Nenhum registro encontrado para este período.</p>
                          </div>
                        )}
                        {metrics.data?.transactions?.map((tx: any) => {
                          const kind = kidEntryKind(tx);
                          return (
                          <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "size-8 rounded-lg flex items-center justify-center",
                                kind === "kidExpense" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                              )}>
                                {kind === "kidExpense" ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-tight">
                                  {kind === "kidExpense" ? "🛍️ Gasto do Filho" : "💰 Recebido"}
                                  {tx.kidName ? (
                                    <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[9px] font-bold">
                                      {kind === "kidExpense" ? tx.kidName : `Para ${tx.kidName}`}
                                    </Badge>
                                  ) : null}
                                  <span className="text-muted-foreground font-normal ml-2">
                                    {String(tx.description || "").replace(/^\[.*?\]\s*/, "")}
                                  </span>
                                </p>
                                <p className="text-[9px] text-muted-foreground">{new Date(`${tx.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                              </div>

                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-xs font-black", kind === "kidExpense" ? "text-rose-600" : "text-emerald-600")}>
                                {tx.transaction_type === 'income' ? "+" : "−"} {formatCurrency(tx.amount)}
                              </span>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-7">
                                      <MoreVertical className="size-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <EditTransactionForm 
                                      transaction={tx}
                                      onUpdate={(values: any) => updateMutation.mutate({ data: { transactionId: tx.id, ...values } })}
                                      onDelete={() => {
                                        requestKidDelete(tx.id);
                                      }}
                                      isPending={updateMutation.isPending || deleteMutation.isPending}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Barra de Status Unificada */}
      <div className="px-4 py-2 border-y bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monitoramento Realtime Ativo</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-primary" />
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">
              {dependents?.filter(d => d.kid_user_id).length || 0} Filhos Conectados
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-4 border-b border-border/50 bg-muted/5">
              <TabsList className="h-10 bg-transparent gap-4 p-0">
                <TabsTrigger 
                  value="overview" 
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest"
                >
                  <Activity className="size-3 mr-2" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="goals" 
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest"
                >
                  <Target className="size-3 mr-2" /> Metas & Limites
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest"
                >
                  <FileText className="size-3 mr-2" /> Histórico Auditoria
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0 focus-visible:outline-none">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {/* Form & Stats */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <TrendingUp className="size-8" />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Saldo Real Enviado</p>
                      <p className="text-lg font-black text-emerald-600">{formatCurrency(stats.totalSent)}</p>
                      <p className="text-[8px] text-emerald-600/60 mt-0.5 leading-none font-bold">Total que saiu do seu bolso</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <PiggyBank className="size-8" />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-primary mb-1">Saldo em Mãos (Filhos)</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black text-primary">
                          {formatCurrency(
                            metrics.data?.transactions?.reduce((acc: number, tx: any) => {
                              const isKidSelf = tx.tags?.includes("kid_self_expense");
                              if (isKidSelf) return acc - (tx.transaction_type === 'expense' ? tx.amount : -tx.amount);
                              return acc + tx.amount;
                            }, 0) || 0
                          )}
                        </p>
                        <Badge variant="outline" className="h-4 text-[7px] bg-primary/10 text-primary border-primary/20 font-bold px-1 uppercase">REALTIME</Badge>
                      </div>
                      <p className="text-[8px] text-muted-foreground mt-0.5 leading-none italic">O que eles ainda têm para usar</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/50 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <TrendingDown className="size-8" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Consumo dos Filhos</p>
                        <p className="text-lg font-black text-foreground">{formatCurrency(stats.totalKidSpent)}</p>
                      </div>
                      <Badge variant="outline" className="h-5 text-[9px] bg-muted text-muted-foreground border-border font-bold px-2 uppercase shrink-0">Informativo</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary/60 h-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (stats.totalKidSpent / Math.max(1, stats.totalSent)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-muted-foreground leading-none font-bold flex items-center gap-1">
                         Eles já gastaram {Math.round((stats.totalKidSpent / Math.max(1, stats.totalSent)) * 100)}% do valor enviado
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ações Rápidas</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Dialog open={giveMoneyOpen} onOpenChange={setGiveMoneyOpen}>
                        <DialogTrigger asChild>
                          <Button className="h-10 text-[11px] font-bold gap-2 shadow-sm">
                            <Plus className="size-3.5" /> Inserir Valor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <GiveMoneyForm 
                            kids={kids} 
                            initialKidId={selectedKidId === "all" ? kids[0]?.id : selectedKidId} 
                            onSubmit={(data) => giveMoneyMutation.mutate({ data })}
                            isPending={giveMoneyMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="h-10 text-[11px] font-bold gap-2" asChild>
                        <a href="/kids">
                          <Users className="size-3.5" /> Ver Espaços
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                    <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-200">
                      Valores inseridos aqui aparecem no painel da criança e são registrados como <strong>Despesa</strong> no seu extrato principal automaticamente.
                    </p>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="p-4 md:col-span-2 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Evolução: Enviado vs Gasto</Label>
                    {metrics.isFetching && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                  </div>
                  
                  <div className="flex-1 h-[250px] w-full min-h-[250px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} 
                            tickFormatter={(v) => `R$ ${v}`}
                          />
                          <Tooltip 
                            cursor={tooltipProps.cursor}
                            contentStyle={tooltipProps.contentStyle}
                            labelStyle={tooltipProps.labelStyle}
                            itemStyle={tooltipProps.itemStyle}
                            formatter={(value: number) => [formatCurrency(value), "Total"]}
                          />
                          <Bar dataKey="total" fill={CHART_TOKENS.expense} radius={[6, 6, 0, 0]} maxBarSize={26} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <BarChart3 className="size-8 mb-2" />
                        <p className="text-[11px]">Nenhum dado para exibir no período</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="m-0 focus-visible:outline-none p-6 space-y-6">
              <KidGoalsSection selectedKidId={selectedKidId} kids={kids} />
            </TabsContent>

            <TabsContent value="history" className="m-0 focus-visible:outline-none">
              <div className="p-4 bg-muted/5 border-b border-border/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Comparação (Este mês vs Mês passado)</Label>
                    <Info className="size-3 text-muted-foreground" />
                  </div>
                  {metrics.data?.summary && (
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[8px] font-bold uppercase text-muted-foreground">Variação Enviada</p>
                        <p className={cn(
                          "text-[10px] font-black tabular-nums",
                          (metrics.data.summary.current.sent - metrics.data.summary.previous.sent) >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {(metrics.data.summary.current.sent - metrics.data.summary.previous.sent) >= 0 ? "+" : ""}
                          {formatCurrency(metrics.data.summary.current.sent - metrics.data.summary.previous.sent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold uppercase text-muted-foreground">Variação Gasto</p>
                        <p className={cn(
                          "text-[10px] font-black tabular-nums",
                          (metrics.data.summary.current.spent - metrics.data.summary.previous.spent) >= 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {(metrics.data.summary.current.spent - metrics.data.summary.previous.spent) >= 0 ? "+" : ""}
                          {formatCurrency(metrics.data.summary.current.spent - metrics.data.summary.previous.spent)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtros: criança, tipo de movimentação e intervalo de datas */}
              <div className="flex flex-wrap items-end gap-3 border-b border-border/50 bg-background px-4 py-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground">Criança</Label>
                  <Select value={histKidId} onValueChange={(v) => { setHistKidId(v); setPage(1); }}>
                    <SelectTrigger className="h-8 w-40 text-xs font-semibold">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Todas as crianças</SelectItem>
                      {kids.map((k) => (
                        <SelectItem key={k.id} value={k.id} className="text-xs">{k.nickname || k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground">Movimentação</Label>
                  <Select value={histKind} onValueChange={(v) => { setHistKind(v); setPage(1); }}>
                    <SelectTrigger className="h-8 w-44 text-xs font-semibold">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Todas</SelectItem>
                      <SelectItem value="sent" className="text-xs">Ganho enviado pelos pais</SelectItem>
                      <SelectItem value="kidIncome" className="text-xs">Ganho registrado pelo filho</SelectItem>
                      <SelectItem value="kidExpense" className="text-xs">Gasto do filho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground">De</Label>
                  <Input
                    type="date"
                    value={histStart}
                    onChange={(e) => { setHistStart(e.target.value); setPage(1); }}
                    className="h-8 w-36 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground">Até</Label>
                  <Input
                    type="date"
                    value={histEnd}
                    onChange={(e) => { setHistEnd(e.target.value); setPage(1); }}
                    className="h-8 w-36 text-xs"
                  />
                </div>

                {(histKidId !== "all" || histKind !== "all" || histStart || histEnd) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase"
                    onClick={() => { setHistKidId("all"); setHistKind("all"); setHistStart(""); setHistEnd(""); setPage(1); }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              <div className="divide-y divide-border/30">
                {metrics.data?.transactions?.map((tx: any) => {
                  const kind = kidEntryKind(tx);
                  const sync = syncStatusFor(tx);
                  return (
                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center",
                          kind === "kidExpense" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                        )}>
                          {kind === "kidExpense" ? <TrendingDown className="size-5" /> : <TrendingUp className="size-5" />}
                        </div>
                        <div>
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <p className="text-xs font-black uppercase tracking-wider">
                              {kind === "kidExpense" ? "Gasto do Filho" : "Envio de Saldo"}
                            </p>
                            {tx.kidName ? (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1.5 text-[9px] font-bold tracking-wide"
                              >
                                {kind === "kidExpense" ? tx.kidName : `Para ${tx.kidName}`}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {String(tx.description || "").replace(/^\[.*?\]\s*/, "")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-muted-foreground/60">{new Date(`${tx.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                            <Badge variant="outline" className="h-3.5 text-[7px] font-black uppercase px-1">{sync.label}</Badge>
                            {tx.tags?.includes("kid_self_expense") && (
                              <Badge variant="outline" className="h-3.5 text-[7px] font-black uppercase px-1 text-rose-600 border-rose-600/20">Auditado</Badge>
                            )}
                          </div>
                        </div>

                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={cn("text-sm font-black tabular-nums", kind === "kidExpense" ? "text-rose-600" : "text-emerald-600")}>
                            {tx.transaction_type === 'income' ? "+" : "−"} {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-[9px] text-muted-foreground/60 italic">Afeta Saldo: {tx.tags?.includes("kid_self_expense") ? "Não" : "Sim"}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setDetails(tx)}>
                          <Info className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {metrics.data && metrics.data.totalCount > PAGE_SIZE && (
                <div className="px-6 py-3 border-t bg-muted/5 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">Mostrando {metrics.data.transactions.length} de {metrics.data.totalCount} registros</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[10px]" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[10px]" 
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * PAGE_SIZE >= metrics.data.totalCount}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="px-4 py-3 bg-muted/10 border-t border-border/50 flex flex-wrap gap-4 items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium">PIX: {formatCurrency(stats.byType.pix)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-medium">Dinheiro: {formatCurrency(stats.byType.cash)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-medium">Presentes: {formatCurrency(stats.byType.gift)}</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold gap-1.5"
                  onClick={() => exportPDF(metrics.data?.transactions, kids.find(k => k.id === selectedKidId))}
                >
                  <Download className="size-3" /> Exportar PDF
                </Button>
                <Button variant="link" className="h-auto p-0 text-[10px] font-bold" asChild>
                  <a href="/dashboard">Ver extrato <ChevronRight className="size-3 ml-0.5" /></a>
                </Button>
             </div>
          </div>

          {/* List of recent actions for management */}
          {metrics.data?.transactions && metrics.data.transactions.length > 0 && (
            <div className="border-t border-border/50">
              <div className="px-4 py-2 bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-3 text-primary animate-pulse" />
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Monitoramento em Tempo Real</Label>
                </div>
                {metrics.isFetching && <Loader2 className="size-2 animate-spin text-muted-foreground" />}
              </div>
              <div className="max-h-[200px] overflow-y-auto divide-y divide-border/30">
                {metrics.data.transactions.slice(0, 5).map((tx: any) => {
                  const kind = kidEntryKind(tx);
                  const sync = syncStatusFor(tx);
                  return (
                  <div key={tx.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <button
                      type="button"
                      onClick={() => setDetails(tx)}
                      className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                      aria-label={`Ver detalhes de ${tx.description}`}
                    >
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center",
                        kind === "kidExpense" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                        tx.tags?.includes("type:pix") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        tx.tags?.includes("type:cash") ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" :
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {kind === "kidExpense" ? <TrendingDown className="size-4" /> :
                         tx.tags?.includes("type:gift") ? <Gift className="size-4" /> : <Coins className="size-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold leading-tight truncate">
                          <span className={cn(kidEntryTone(kind))}>
                            {kind === "kidExpense" ? "🛍️ Registrado pelo Filho" : "💰 Enviado por Mim"}
                          </span>
                          <span className="text-muted-foreground font-semibold">
                            {" · "}
                            {kind === "kidExpense"
                              ? tx.description
                              : (tx.description.replace("[Envio para ", "").split("]")[1]?.trim() || tx.description)}
                          </span>
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {new Date(`${tx.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")} · {sync.label}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[11px] font-black tabular-nums", kidEntryTone(kind))}>
                        {formatCurrency(tx.amount)}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Edit2 className="size-3 text-muted-foreground" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <EditTransactionForm 
                            transaction={tx} 
                            onUpdate={(data: { amount: number, description: string }) => updateMutation.mutate({ data: { transactionId: tx.id, ...data } })}
                            onDelete={() => requestKidDelete(tx.id)}
                            isPending={updateMutation.isPending || deleteMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
      <KidEntryDetailsDialog
        entry={details}
        kidName={kids.find((k) => k.id === selectedKidId)?.name ?? null}
        open={details !== null}
        onOpenChange={(value: boolean) => !value && setDetails(null)}
      />
    </Card>
  );
}

// PDF Export Helper
async function exportPDF(data: any[] | undefined, selectedKid?: Dependent) {
  if (!data || !selectedKid) return;
  toast.info("Gerando PDF...", { description: "Suas métricas estão sendo preparadas para download." });
  
  try {
    const { exportKidsSummaryPdf } = await import("@/lib/kids-export");
    
    const rows = data.map(tx => ({
      date: tx.transaction_date,
      description: tx.description,
      type: tx.transaction_type as "income" | "expense",
      amount: tx.amount
    }));

    const income = data.filter(tx => tx.transaction_type === "income").reduce((a, b) => a + Number(b.amount), 0);
    const expense = data.filter(tx => tx.transaction_type === "expense").reduce((a, b) => a + Number(b.amount), 0);

    await exportKidsSummaryPdf(
      rows,
      { income, expense, balance: income - expense, count: rows.length },
      { kidName: selectedKid.name, periodLabel: "Relatório de Gestão", typeLabel: "Todos os registros" }
    );

    toast.success("PDF baixado com sucesso!");
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    toast.error("Erro ao gerar PDF.");
  }
}

function EditTransactionForm({ transaction, onUpdate, onDelete, isPending }: any) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    description: transaction.description.replace(/\[.*\]\s*/, "")
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Botão de excluir desabilitado durante qualquer processamento
  const isActionPending = isPending;

  if (showDeleteConfirm) {
    return (
      <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-14 rounded-full bg-rose-500/10 flex items-center justify-center">
            <Trash2 className="size-7 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">Confirmar exclusão?</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Esta ação removerá permanentemente o lançamento de <strong className="text-rose-500">{formatCurrency(transaction.amount)}</strong>. O saldo do seu filho será atualizado em tempo real.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-11 font-bold" 
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isActionPending}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20" 
            onClick={onDelete} 
            disabled={isActionPending}
          >
            {isActionPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="size-4 mr-2" />
            )}
            Excluir Agora
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/60 italic">
          Dica: Você pode desfazer exclusões acidentais através do suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Editar Lançamento</DialogTitle>
        <DialogDescription>Ajuste os valores ou a descrição do envio.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>Valor</Label>
          <MoneyInput 
            value={amountToInput(formData.amount)} 
            onValueChange={(v) => setFormData({...formData, amount: parseAmount(v)})}
          />
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Input 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => setShowDeleteConfirm(true)}>
          Excluir
        </Button>
        <div className="flex gap-2 flex-1 sm:flex-initial">
          <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>Cancelar</Button>
          <Button 
            onClick={() => onUpdate(formData)} 
            disabled={isPending}
            className="flex-1"
          >
            {isPending && <Loader2 className="size-4 animate-spin mr-2" />} 
            Salvar Alterações
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}

function GiveMoneyForm({ kids, initialKidId, onSubmit, isPending }: { 
  kids: Dependent[], 
  initialKidId?: string,
  onSubmit: (data: any) => void,
  isPending: boolean 
}) {
  const [formData, setFormData] = useState({
    dependentId: initialKidId || kids[0]?.id || "",
    amount: 0,
    description: "",
    type: "pix" as "pix" | "cash" | "gift" | "value",
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [reviewing, setReviewing] = useState(false);
  const selectedKid = kids.find((kid) => kid.id === formData.dependentId);

  if (reviewing) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirmar envio?</DialogTitle>
          <DialogDescription>Revise os dados para evitar alterações acidentais na carteira.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <p className="text-muted-foreground">Destino</p>
          <p className="font-semibold">{selectedKid?.nickname || selectedKid?.name || "Filho"}</p>
          <p className="mt-3 text-muted-foreground">Valor</p>
          <p className="text-xl font-black text-primary">{formatCurrency(formData.amount)}</p>
          <p className="mt-3 text-muted-foreground">Motivo</p>
          <p className="font-medium">{formData.description}</p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button variant="outline" disabled={isPending} onClick={() => setReviewing(false)}>Voltar</Button>
          <Button disabled={isPending} onClick={() => onSubmit(formData)}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
            Confirmar
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Coins className="size-5 text-primary" /> Inserir Valor para Filho
        </DialogTitle>
        <DialogDescription>
          O valor será creditado no Espaço Kid e debitado como despesa no seu painel.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="kid">Filho(a)</Label>
          <Select 
            value={formData.dependentId} 
            onValueChange={(v) => setFormData({...formData, dependentId: v})}
          >
            <SelectTrigger id="kid">
              <SelectValue placeholder="Selecione a criança" />
            </SelectTrigger>
            <SelectContent>
              {kids.map(kid => (
                <SelectItem key={kid.id} value={kid.id}>{kid.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <MoneyInput 
              value={amountToInput(formData.amount)} 
              onValueChange={(v) => setFormData({...formData, amount: parseAmount(v)})}
              placeholder="R$ 0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v: any) => setFormData({...formData, type: v})}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro / Cédula</SelectItem>
                <SelectItem value="gift">Presente</SelectItem>
                <SelectItem value="value">Outro Valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição / Motivo</Label>
          <Input 
            id="description" 
            placeholder="Ex: Mesada da semana, Presente de aniversário..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="date">Data</Label>
          </div>
          <Input 
            id="date" 
            type="date"
            value={formData.transactionDate}
            onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
          />
        </div>
      </div>

      <DialogFooter>
        <Button 
          className="w-full font-bold h-11" 
          disabled={isPending || !formData.amount || !formData.description || !formData.dependentId}
          onClick={() => setReviewing(true)}
        >
          {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
          Revisar envio
        </Button>
      </DialogFooter>
    </div>
  );
}

function EditTxForm({ tx, onSave }: { tx: any, onSave: (values: any) => void }) {
  const [description, setDescription] = useState(tx.description.replace(/^\[Envio\]\s*/, ""));
  const [amount, setAmount] = useState(tx.amount.toString());

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <MoneyInput value={amount} onValueChange={setAmount} />
      </div>
      <Button className="w-full" onClick={() => onSave({ description, amount: parseAmount(amount) })}>
        Salvar Alterações
      </Button>
    </div>
  );
}

function KidGoalsSection({ selectedKidId, kids }: { selectedKidId: string, kids: any[] }) {
  const queryClient = useQueryClient();
  const saveGoal = useServerFn(saveKidGoal);
  const deleteGoal = useServerFn(deleteKidGoal);
  const updateSettings = useServerFn(updateKidSettings);

  const { data: goals, isLoading } = useQuery({
    queryKey: ["kid-goals", selectedKidId],
    queryFn: () => getKidGoals({ data: { dependentId: selectedKidId === "all" ? kids[0]?.id : selectedKidId } }),
    enabled: !!(selectedKidId === "all" ? (kids?.length > 0 ? kids[0].id : null) : selectedKidId)
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => saveGoal({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kid-goals"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kid-goals"] }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => updateSettings({ data }),
    onSuccess: () => {
      toast.success("Configurações atualizadas");
      queryClient.invalidateQueries({ queryKey: ["dependents"] });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const currentKid = selectedKidId === "all" ? null : kids.find(k => k.id === selectedKidId);

  return (
    <div className="space-y-8">
      {currentKid && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Alertas & Limites</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-4 border-dashed">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase">Aviso de Saldo Baixo</Label>
                  <Bell className="size-3 text-amber-500" />
                </div>
                <div className="flex gap-2">
                  <MoneyInput 
                    value={amountToInput(currentKid.monthly_limit || 0)}
                    onValueChange={(v) => {
                      updateSettingsMutation.mutate({ 
                        dependentId: currentKid.id, 
                        lowBalanceAlertThreshold: parseAmount(v) 
                      });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground italic">Você receberá um alerta quando o saldo ficar abaixo deste valor.</p>
              </div>
            </Card>

            <Card className="p-4 border-dashed">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase">Limite Semanal Sugerido</Label>
                  <TrendingDown className="size-3 text-rose-500" />
                </div>
                <div className="flex gap-2">
                  <MoneyInput 
                    value="0,00"
                    disabled
                    className="h-8 text-xs opacity-50"
                  />
                </div>
                <Badge variant="secondary" className="text-[8px] uppercase">Em Breve</Badge>
              </div>
            </Card>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Metas Educativas</h3>
          </div>
          <Button size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={() => {
            if (selectedKidId === "all") {
              toast.error("Selecione um filho específico para criar uma meta");
              return;
            }
            saveMutation.mutate({
              dependentId: selectedKidId,
              title: "Adicionar Meta",
              targetAmount: 100,
              period: "monthly"
            });
          }}>
            <Plus className="size-3 mr-1" /> Adicionar Meta
          </Button>
        </div>

        <div className="grid gap-3">
          {goals?.map((goal: any) => (
            <div key={goal.id} className="p-4 rounded-2xl bg-muted/30 border border-border/50 group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider">{goal.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Meta: {formatCurrency(goal.target_amount)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(goal.id)}
                >
                  <Trash2 className="size-4 text-rose-500" />
                </Button>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-primary">{Math.round(((goal.current_amount || 0) / goal.target_amount) * 100)}%</span>
                </div>
                <Progress value={((goal.current_amount || 0) / goal.target_amount) * 100} className="h-1.5" />
              </div>
            </div>
          ))}

          {goals?.length === 0 && (
            <div className="p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="size-8 mb-2 opacity-20" />
              <p className="text-[11px] font-medium">Nenhuma meta ativa para este filho.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
