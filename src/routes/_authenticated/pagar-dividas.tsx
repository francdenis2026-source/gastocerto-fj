import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Circle,
  Banknote,
  History,
  Clock,
  Search,
  Bell,
  CalendarCheck
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useCommitments, useCommitmentEntries, summarizeAll } from "@/lib/commitments";
import { useSyncNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/finance/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pagar-dividas")({
  head: () => ({
    meta: [
      { title: "Pagar Dívidas — GastoCerto" },
      { name: "description", content: "Checklist passo a passo para quitar suas dívidas em atraso." },
    ],
  }),
  component: PayDebtsPage,
});

function PayDebtsPage() {
  const { data: commitments, isLoading: isLoadingCommitments } = useCommitments();
  const { data: entries, isLoading: isLoadingEntries } = useCommitmentEntries();
  const syncNotifications = useSyncNotifications();
  
  const summaries = useMemo(() => summarizeAll(commitments ?? [], entries ?? []), [commitments, entries]);
  const overdueItems = summaries.filter((s: any) => s.overdue && s.commitment.status === 'open');
  const paidItems = summaries.filter((s: any) => s.commitment.status === 'paid' || (s.outstanding === 0 && s.paid > 0));

  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Efeito para sincronizar notificações de atraso
  useEffect(() => {
    if (overdueItems.length > 0) {
      const drafts = overdueItems.map(item => ({
        notification_type: "debt_overdue",
        title: "Dívida em Atraso",
        message: `O compromisso "${item.commitment.name}" está vencido. Valor pendente: ${formatCurrency(item.outstanding)}.`,
        severity: "warning" as const,
        link: "/pagar-dividas",
        reference_id: item.commitment.id,
        dedupe_key: `overdue-${item.commitment.id}-${new Date().toISOString().split('T')[0]}`
      }));
      syncNotifications.mutate(drafts);
    }
  }, [overdueItems.length]);

  const filteredOverdue = overdueItems.filter((item: any) => 
    item.commitment.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPaid = paidItems.filter((item: any) => 
    item.commitment.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCheck = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
        <PageHeader
          icon={AlertTriangle}
          eyebrow="Planejamento"
          title="Plano de quitação"
          description="Gerencie suas pendências, veja o que já foi quitado e ative lembretes de pagamento."
          actions={
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Link to="/compromissos">
                <ArrowLeft className="size-3.5" />
                Compromissos
              </Link>
            </Button>
          }
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar compromisso..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-border bg-card shadow-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => toast.info("Lembretes ativados para todas as dívidas em atraso.")}>
            <Bell className="size-4" />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1 h-12">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Clock className="size-4 mr-2" />
              Em Atraso
              {overdueItems.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 min-w-[1.2rem] h-[1.2rem] justify-center text-[10px]">
                  {overdueItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <History className="size-4 mr-2" />
              Histórico / Quitados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {filteredOverdue.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-3">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <h2 className="text-lg font-bold text-emerald-600">Parabéns! Nenhuma dívida em atraso.</h2>
                <p className="text-sm text-muted-foreground">Suas contas estão em dia.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOverdue.map((item: any) => (
                  <div 
                    key={item.commitment.id}
                    className={cn(
                      "rounded-2xl border border-border bg-card overflow-hidden transition-all",
                      checked[item.commitment.id] ? "opacity-60 grayscale-[0.5]" : "shadow-sm"
                    )}
                  >
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">{item.commitment.name}</h3>
                          <Badge variant="outline" className="text-[10px] py-0 border-destructive/20 text-destructive bg-destructive/5">
                            Atrasado
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {formatCurrency(item.outstanding)} Pendente • Venceu em {item.nextDue ? formatDate(item.nextDue) : '—'}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleCheck(item.commitment.id)}
                        className="size-6 rounded-full border-2 border-primary/30 flex items-center justify-center transition-colors hover:border-primary"
                      >
                        {checked[item.commitment.id] ? (
                          <CheckCircle2 className="size-5 text-primary fill-primary/10" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground/30" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-2 rounded-lg bg-muted/20 border border-border/50">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">Total Contratado</p>
                          <p className="text-xs font-bold">{formatCurrency(item.contracted)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/20 border border-border/50">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">Total Pago</p>
                          <p className="text-xs font-bold text-emerald-600">{formatCurrency(item.paid)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                          <p className="text-xs leading-relaxed">Confirme o valor e realize o pagamento.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
                          <p className="text-xs leading-relaxed">Registre a baixa clicando no botão abaixo.</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          asChild 
                          className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                        >
                          <Link to="/compromissos" search={{ edit: item.commitment.id }}>
                            <Banknote className="mr-2 size-4" />
                            Registrar Pagamento Agora
                            <ChevronRight className="ml-auto size-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {filteredPaid.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                <History className="size-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Nenhum histórico de quitados encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPaid.map((item: any) => (
                  <div key={item.commitment.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CalendarCheck className="size-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{item.commitment.name}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          Total Pago: {formatCurrency(item.paid)} • {item.commitment.status === 'paid' ? 'Quitado' : 'Sem saldo devedor'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="rounded-xl text-xs h-8">
                      <Link to="/compromissos" search={{ edit: item.commitment.id }}>Detalhes</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
