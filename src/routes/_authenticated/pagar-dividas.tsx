import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Circle,
  Banknote
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useCommitments, useCommitmentEntries, summarizeAll } from "@/lib/commitments";
import { cn } from "@/lib/utils";

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
  
  const summaries = useMemo(() => summarizeAll(commitments ?? [], entries ?? []), [commitments, entries]);
  const overdueItems = summaries.filter((s: any) => s.overdue && s.commitment.status === 'open');

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <header className="space-y-2">
          <Link to="/diario" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" />
            Voltar para o Histórico
          </Link>
          <h1 className="page-title text-2xl flex items-center gap-2">
            <AlertTriangle className="size-6 text-destructive" />
            Pagar Dívidas em Atraso
          </h1>
          <p className="page-subtitle text-sm">
            Siga o checklist para regularizar sua situação financeira.
          </p>
        </header>

        {overdueItems.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-3">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-600">Parabéns! Nenhuma dívida em atraso.</h2>
            <p className="text-sm text-muted-foreground">Você está com suas contas em dia no momento.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/painel">Ver Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {overdueItems.map((item: any) => (
              <div 
                key={item.commitment.id}
                className={cn(
                  "rounded-2xl border border-border bg-card overflow-hidden transition-all",
                  checked[item.commitment.id] ? "opacity-60 grayscale-[0.5]" : "shadow-sm"
                )}
              >
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{item.commitment.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {formatCurrency(item.outstanding)} Pendente
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
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                      <p className="text-xs leading-relaxed">Verifique o valor total atualizado e a data de vencimento original.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
                      <p className="text-xs leading-relaxed">Realize o pagamento através do seu banco ou carteira digital.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">3</div>
                      <p className="text-xs leading-relaxed">Registre a baixa aqui no sistema para atualizar seu saldo e relatórios.</p>
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
      </div>
    </AppShell>
  );
}
