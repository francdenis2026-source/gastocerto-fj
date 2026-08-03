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
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatCurrency } from "@/lib/format";
import { giveMoneyToKid, getKidsFinancialMetrics } from "@/lib/kids-management.functions";
import { deleteKidManagementTransaction, updateKidManagementTransaction } from "@/lib/kids-management-actions.functions";
import { cn } from "@/lib/utils";
import { CHART_TOKENS, tooltipProps } from "@/lib/chart-theme";
import { useAuth } from "@/hooks/use-auth";
import { useParentKidsRealtime } from "@/lib/kids-space-realtime";

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

  const fetchMetrics = useServerFn(getKidsFinancialMetrics);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Gastos feitos pela criança aparecem aqui em tempo real.
  useParentKidsRealtime(user?.id);

  const metrics = useQuery({
    queryKey: ["kids_financial_metrics", selectedKidId, new Date().getMonth(), new Date().getFullYear()],
    queryFn: () => fetchMetrics({ 
      data: { 
        dependentId: selectedKidId === "all" ? undefined : selectedKidId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      } 
    }),
  });

  const giveMoneyMutation = useMutation({
    mutationFn: useServerFn(giveMoneyToKid),
    onSuccess: () => {
      toast.success("Valor enviado com sucesso!");
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

  const [lastDeleted, setLastDeleted] = useState<any>(null);

  const deleteMutation = useMutation({
    mutationFn: (vars: { data: { transactionId: string } }) => useServerFn(deleteKidManagementTransaction)(vars),
    onSuccess: (_, variables) => {
      const deletedId = variables.data.transactionId;
      const deletedTx = metrics.data?.find(t => t.id === deletedId);
      if (deletedTx) setLastDeleted(deletedTx);
      
      toast.success("Lançamento removido.", {
        action: {
          label: "Desfazer",
          onClick: () => {
            // A restauração exigiria uma função server-side de "undo" ou re-inserção
            toast.info("Restauração solicitada.");
          }
        }
      });
      queryClient.invalidateQueries({ queryKey: ["kids_financial_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: useServerFn(updateKidManagementTransaction),
    onSuccess: () => {
      toast.success("Lançamento atualizado.");
      queryClient.invalidateQueries({ queryKey: ["kids_financial_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
      setKidDetailsOpen(false);
    }
  });

  const chartData = useMemo(() => {
    if (!metrics.data) return [];
    
    // Group by month/year
    const grouped: Record<string, number> = {};
    metrics.data.forEach(tx => {
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
    if (!metrics.data) return { total: 0, byType: { cash: 0, pix: 0, gift: 0, value: 0 }, count: 0 };
    
    let total = 0;
    const byType = { cash: 0, pix: 0, gift: 0, value: 0 };
    
    metrics.data.forEach(tx => {
      total += tx.amount;
      const typeTag = (tx.tags || []).find(t => t.startsWith("type:"));
      if (typeTag) {
        const type = typeTag.split(":")[1] as keyof typeof byType;
        if (byType[type] !== undefined) byType[type] += tx.amount;
      }
    });

    return { total, byType, count: metrics.data.length };
  }, [metrics.data]);

  if (loadingDeps) return <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (kids.length === 0) return null;

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
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
          <div className="flex items-center gap-2">
            <Select value={selectedKidId} onValueChange={setSelectedKidId}>
              <SelectTrigger className="w-40 h-8 text-[11px] bg-background">
                <Users className="size-3 mr-1.5 opacity-50" />
                <SelectValue placeholder="Selecionar filho" />
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
                className="h-8 text-[10px] font-bold gap-1.5"
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

                    <div className="grid grid-cols-3 gap-3">
                       <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                         <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Recebido</p>
                         <p className="text-lg font-black">{formatCurrency(metrics.data?.filter(t => t.transaction_type === 'income').reduce((a, b) => a + b.amount, 0) || 0)}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                         <p className="text-[9px] font-bold uppercase text-rose-600 mb-1">Gastos</p>
                         <p className="text-lg font-black">{formatCurrency(metrics.data?.filter(t => t.transaction_type === 'expense').reduce((a, b) => a + b.amount, 0) || 0)}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                         <p className="text-[9px] font-bold uppercase text-primary mb-1">Saldo</p>
                         <p className="text-lg font-black">{formatCurrency((metrics.data?.filter(t => t.transaction_type === 'income').reduce((a, b) => a + b.amount, 0) || 0) - (metrics.data?.filter(t => t.transaction_type === 'expense').reduce((a, b) => a + b.amount, 0) || 0))}</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Movimentações em tempo real</Label>
                      <div className="divide-y border rounded-xl overflow-hidden">
                        {metrics.data?.map((tx: any) => (
                          <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "size-8 rounded-lg flex items-center justify-center",
                                tx.transaction_type === 'income' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                              )}>
                                {tx.transaction_type === 'income' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-tight">{tx.description}</p>
                                <p className="text-[9px] text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-xs font-black", tx.transaction_type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                                {tx.transaction_type === 'income' ? "+" : "-"} {formatCurrency(tx.amount)}
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
                                      onDelete={() => deleteMutation.mutate({ data: { transactionId: tx.id } })}
                                      isPending={updateMutation.isPending || deleteMutation.isPending}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        ))}
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

      {isExpanded && (
        <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {/* Form & Stats */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Enviado</p>
                  <p className="text-lg font-black text-primary">{formatCurrency(stats.total)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Movimentações</p>
                  <p className="text-lg font-black text-foreground">{stats.count}</p>
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
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Histórico de Gastos com Filhos</Label>
                {metrics.isFetching && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              </div>
              
              <div className="flex-1 h-[200px] w-full min-h-[200px]">
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
                  onClick={() => exportPDF(metrics.data, kids.find(k => k.id === selectedKidId))}
                >
                  <Download className="size-3" /> Exportar PDF
                </Button>
                <Button variant="link" className="h-auto p-0 text-[10px] font-bold" asChild>
                  <a href="/dashboard">Ver extrato <ChevronRight className="size-3 ml-0.5" /></a>
                </Button>
             </div>
          </div>

          {/* List of recent actions for management */}
          {metrics.data && metrics.data.length > 0 && (
            <div className="border-t border-border/50">
              <div className="px-4 py-2 bg-muted/5 flex items-center justify-between">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Lançamentos Recentes</Label>
              </div>
              <div className="max-h-[200px] overflow-y-auto divide-y divide-border/30">
                {metrics.data.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center",
                        tx.tags?.includes("type:pix") ? "bg-emerald-500/10 text-emerald-600" :
                        tx.tags?.includes("type:cash") ? "bg-sky-500/10 text-sky-600" :
                        tx.tags?.includes("kid_self_expense") ? "bg-rose-500/10 text-rose-600" :
                        "bg-amber-500/10 text-amber-600"
                      )}>
                        {tx.tags?.includes("kid_self_expense") ? <TrendingDown className="size-4" /> : 
                         tx.tags?.includes("type:gift") ? <Gift className="size-4" /> : <Coins className="size-4" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold leading-tight">
                          {tx.tags?.includes("kid_self_expense") ? `[Gasto do Filho] ${tx.description}` : 
                           (tx.description.replace("[Envio para ", "").split("]")[1]?.trim() || tx.description)}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black">{formatCurrency(tx.amount)}</span>
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
                            onDelete={() => deleteMutation.mutate({ data: { transactionId: tx.id } })}
                            isPending={updateMutation.isPending || deleteMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
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

  if (showDeleteConfirm) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="size-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Excluir lançamento?</h3>
            <p className="text-sm text-muted-foreground">Esta ação removerá o gasto do seu extrato e a receita do saldo do seu filho.</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button variant="destructive" className="flex-1" onClick={onDelete} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
            Confirmar Exclusão
          </Button>
        </div>
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
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>Cancelar</Button>
          <Button onClick={() => onUpdate(formData)} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin mr-2" />} Salvar
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
          onClick={() => onSubmit(formData)}
        >
          {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
          Confirmar Envio
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
