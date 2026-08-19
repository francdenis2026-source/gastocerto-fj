import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, History, Lightbulb, Plus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { EnergyBillDialog } from "@/components/finance/dialogs/energy-bill-dialog";
import { PageHeader } from "@/components/finance/page-header";
import { StatTile } from "@/components/finance/stat-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { axisProps, gridProps, tooltipProps } from "@/lib/chart-theme";
import { useEnergyInsights } from "@/lib/energy-analytics";
import { useEnergyBills, type EnergyBill } from "@/lib/energy";
import { formatCurrency, formatDate } from "@/lib/format-utils";

export const Route = createFileRoute("/_authenticated/energia")({
  head: () => ({
    meta: [
      { title: "Consumo de Energia — GastoCerto" },
      {
        name: "description",
        content: "Acompanhe seu consumo de energia elétrica, custos e tendências.",
      },
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
        <div className="space-y-4" aria-busy="true" aria-label="Carregando dados de energia">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const chartData = sorted.map((bill) => ({
    date: formatDate(bill.bill_date).slice(3),
    kwh: Number(bill.consumption_kwh),
    valor: Number(bill.amount),
  }));

  const openBill = (bill: EnergyBill | null) => {
    setEditing(bill);
    setDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          icon={Zap}
          eyebrow="Consumo residencial"
          title="Energia elétrica"
          description="Monitore seu consumo mensal em kWh, custos e tendências da conta de luz."
          actions={
            <Button onClick={() => openBill(null)}>
              <Plus className="size-4" aria-hidden="true" />
              Lançar fatura
            </Button>
          }
        />

        {stats ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Último consumo"
              value={`${stats.last.consumption_kwh} kWh`}
              icon={stats.variation > 0 ? TrendingUp : TrendingDown}
              tone={stats.variation > 0 ? "warning" : "success"}
              hint={`Em ${formatDate(stats.last.bill_date)}${stats.variation !== 0 ? ` · ${Math.abs(stats.variation).toFixed(1)}% de variação` : ""}`}
            />
            <StatTile
              label="Valor da fatura"
              value={formatCurrency(Number(stats.last.amount))}
              icon={Zap}
              tone="brand"
              hint={`Vencimento: ${stats.last.due_date ? formatDate(stats.last.due_date) : "não informado"}`}
            />
            <StatTile
              label="Média mensal"
              value={`${stats.avgConsumption.toFixed(0)} kWh`}
              icon={BarChart3}
              hint={`Baseado em ${stats.totalCount} ${stats.totalCount === 1 ? "mês" : "meses"}`}
            />
            <StatTile
              label="Custo por kWh"
              value={`R$ ${(Number(stats.last.amount) / Math.max(1, Number(stats.last.consumption_kwh))).toFixed(2)}`}
              icon={TrendingUp}
              hint="Valor médio da unidade na última fatura"
            />
          </div>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
            <Zap className="mx-auto size-10 text-muted-foreground/50" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Nenhuma fatura lançada</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Registre sua última conta de luz para começar a acompanhar consumo, custo e tendências.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => openBill(null)}>
              <Plus className="size-4" aria-hidden="true" />
              Criar primeiro lançamento
            </Button>
          </section>
        )}

        {sorted.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-primary" aria-hidden="true" />
                Histórico de consumo (kWh)
              </h2>
              <div className="h-[260px] w-full sm:h-[300px]" role="img" aria-label="Gráfico do histórico de consumo de energia em quilowatt-hora">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} unit=" kWh" />
                    <Tooltip {...tooltipProps} formatter={(value) => [`${value} kWh`, "Consumo"]} />
                    <Bar dataKey="kwh" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                Evolução do valor (R$)
              </h2>
              <div className="h-[260px] w-full sm:h-[300px]" role="img" aria-label="Gráfico da evolução do valor das contas de energia">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} width={60} />
                    <Tooltip {...tooltipProps} formatter={(value) => [formatCurrency(Number(value)), "Valor"]} />
                    <Line type="monotone" dataKey="valor" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <History className="size-4 text-primary" aria-hidden="true" />
                Últimas faturas
              </h2>
              <ul className="space-y-2">
                {sorted.slice(-5).reverse().map((bill) => (
                  <li key={bill.id}>
                    <button
                      type="button"
                      onClick={() => openBill(bill)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Editar fatura de ${formatDate(bill.bill_date)}, ${formatCurrency(Number(bill.amount))}`}
                    >
                      <span>
                        <span className="block text-sm font-medium">{formatDate(bill.bill_date)}</span>
                        <span className="block text-xs text-muted-foreground">{bill.consumption_kwh} kWh</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-bold tabular-nums text-primary">{formatCurrency(Number(bill.amount))}</span>
                        {bill.due_date ? <span className="block text-[11px] text-muted-foreground">Vence {formatDate(bill.due_date)}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="size-4 text-warning" aria-hidden="true" />
                Dicas de economia
              </h2>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-warning/25 bg-warning/10 p-3">
                  <p className="font-semibold">Horário de ponta</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Evite concentrar o uso de aparelhos de alto consumo entre 18h e 21h quando sua tarifa variar por horário.</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <p className="font-semibold">Consumo em standby</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Desligar aparelhos que ficam ociosos ajuda a reduzir consumo contínuo ao longo do mês.</p>
                </div>
                {stats.variation > 5 ? (
                  <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3" role="alert">
                    <p className="font-semibold text-destructive">Aumento detectado</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Seu consumo subiu {stats.variation.toFixed(1)}% neste mês. Compare hábitos e equipamentos usados no período.</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
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
