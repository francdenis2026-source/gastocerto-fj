import { createFileRoute } from "@tanstack/react-router";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  BarChart3, 
  History,
  Lightbulb
} from "lucide-react";
import { useState } from "react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Line,
  LineChart
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { EnergyBillDialog } from "@/components/finance/energy-bill-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useEnergyBills, type EnergyBill } from "@/lib/energy";
import { useEnergyInsights } from "@/lib/energy-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CHART_TOKENS, 
  axisProps, 
  gridProps, 
  tooltipProps 
} from "@/lib/chart-theme";

export const Route = createFileRoute("/_authenticated/energia")({
  head: () => ({
    meta: [
      { title: "Consumo de Energia — GastoCerto" },
      { name: "description", content: "Acompanhe seu consumo de energia elétrica, custos e tendências." },
    ],
  }),
  component: EnergyPage,
});

function EnergyPage() {
  const { isLoading } = useEnergyBills();
  const { sorted, stats } = useEnergyInsights();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EnergyBill | null>(null);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </AppShell>
    );
  }

  const chartData = sorted.map(b => ({
    date: formatDate(b.bill_date).slice(3),
    kwh: Number(b.consumption_kwh),
    valor: Number(b.amount),
    custoKwh: Number(b.amount) / Number(b.consumption_kwh)
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Zap className="size-6 text-yellow-500" />
              Energia Elétrica
            </h1>
            <p className="page-subtitle mt-1">
              Monitore seu consumo mensal em kWh e o custo da sua conta de luz.
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="mr-2 size-4" />
            Lançar fatura
          </Button>
        </header>

        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Último Consumo</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums">{stats.last.consumption_kwh} kWh</p>
                {stats.variation !== 0 && (
                  <span className={`text-xs flex items-center ${stats.variation > 0 ? 'text-destructive' : 'text-income'}`}>
                    {stats.variation > 0 ? <TrendingUp className="size-3 mr-0.5" /> : <TrendingDown className="size-3 mr-0.5" />}
                    {Math.abs(stats.variation).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Em {formatDate(stats.last.bill_date)}</p>
            </article>

            <article className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor da Fatura</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-primary">{formatCurrency(Number(stats.last.amount))}</p>
              <p className="mt-1 text-xs text-muted-foreground">Vencimento: {stats.last.due_date ? formatDate(stats.last.due_date) : '—'}</p>
            </article>

            <article className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Mensal</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{stats.avgConsumption.toFixed(0)} kWh</p>
              <p className="mt-1 text-xs text-muted-foreground">Baseado em {stats.totalCount} meses</p>
            </article>

            <article className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custo p/ kWh</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">R$ {(Number(stats.last.amount) / Number(stats.last.consumption_kwh)).toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Valor médio da unidade</p>
            </article>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Zap className="mx-auto size-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma fatura lançada</h3>
            <p className="mt-2 text-sm text-muted-foreground">Comece registrando sua última conta de luz para ver as análises.</p>
            <Button variant="outline" className="mt-6" onClick={() => setDialogOpen(true)}>
              Criar primeiro lançamento
            </Button>
          </div>
        )}

        {sorted.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-6">
                <BarChart3 className="size-4 text-primary" />
                Histórico de Consumo (kWh)
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} unit=" kWh" />
                    <Tooltip {...tooltipProps} formatter={(v) => [`${v} kWh`, 'Consumo']} />
                    <Bar dataKey="kwh" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-6">
                <TrendingUp className="size-4 text-primary" />
                Evolução do Valor (R$)
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} width={60} />
                    <Tooltip {...tooltipProps} formatter={(v) => [formatCurrency(Number(v)), 'Valor']} />
                    <Line 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="var(--primary)" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: "var(--primary)" }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <History className="size-4 text-primary" />
                Últimas Faturas
              </h2>
              <div className="space-y-3">
                {sorted.slice(-5).reverse().map((bill) => (
                  <div 
                    key={bill.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition cursor-pointer"
                    onClick={() => { setEditing(bill); setDialogOpen(true); }}
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDate(bill.bill_date)}</p>
                      <p className="text-[11px] text-muted-foreground">{bill.consumption_kwh} kWh</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatCurrency(Number(bill.amount))}</p>
                      {bill.due_date && <p className="text-[10px] text-muted-foreground">Vence {formatDate(bill.due_date)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <Lightbulb className="size-4 text-yellow-500" />
                Dicas de Economia
              </h2>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-sm font-semibold">Horário de Ponta</p>
                  <p className="text-xs text-muted-foreground mt-1">Evite usar chuveiro elétrico e ferro de passar entre 18h e 21h, onde a tarifa pode ser maior dependendo do seu plano.</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm font-semibold">Standby Consome</p>
                  <p className="text-xs text-muted-foreground mt-1">Aparelhos no modo espera podem representar até 12% do consumo total da sua residência.</p>
                </div>
                {stats && stats.variation > 5 && (
                  <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-semibold text-destructive">Aumento Detectado</p>
                    <p className="text-xs text-muted-foreground mt-1">Seu consumo subiu {stats.variation.toFixed(1)}% este mês. Verifique se houve uso atípico de ar-condicionado ou aquecedores.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <EnergyBillDialog 
        bill={editing}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </AppShell>
  );
}
