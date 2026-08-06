import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, TrendingDown, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/finance/page-header";
import { PeriodPicker } from "@/components/finance/period-picker";
import { StatTile } from "@/components/finance/stat-tile";
import { TransactionDialog } from "@/components/finance/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_TOKENS, axisProps, gridProps, tooltipProps } from "@/lib/chart-theme";
import { MONTH_NAMES, monthRange } from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { usePeriodStore } from "@/lib/period-store";
import { useCategories } from "@/lib/queries";
import { findServiceArea, matchesArea, SERVICE_AREAS } from "@/lib/service-areas";
import { useTransactions, type Transaction } from "@/lib/transactions";

export const Route = createFileRoute("/_authenticated/consumo/$slug")({
  loader: ({ params }) => {
    const area = findServiceArea(params.slug);
    if (!area) throw notFound();
    return { slug: area.slug, label: area.label, description: area.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.label ?? "Consumo"} — GastoCerto` },
      { name: "description", content: loaderData?.description ?? "Acompanhe seus gastos por serviço." },
      { property: "og:title", content: `${loaderData?.label ?? "Consumo"} — GastoCerto` },
      { property: "og:description", content: loaderData?.description ?? "Acompanhe seus gastos por serviço." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
        {error.message}
      </p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Esta área de consumo não existe.</p>
        <Button asChild className="mt-3" size="sm">
          <Link to="/painel">Voltar ao painel</Link>
        </Button>
      </div>
    </AppShell>
  ),
  component: ServiceAreaPage,
});

function ServiceAreaPage() {
  const { slug } = Route.useParams();
  const area = findServiceArea(slug)!;
  const Icon = area.icon;

  const { year, month, setPeriod } = usePeriodStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const range = useMemo(() => monthRange(year, month), [year, month]);
  const yearRange = useMemo(() => ({ start: `${year}-01-01`, end: `${year}-12-31` }), [year]);

  const { data: monthRows, isLoading } = useTransactions(range);
  const { data: yearRows } = useTransactions(yearRange);
  const { data: categories } = useCategories();

  const categoryName = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories ?? []) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const belongs = (row: Transaction) => {
    if (row.transaction_type !== "expense") return false;
    const catName = row.category_id ? (categoryName.get(row.category_id) ?? "") : "";
    return matchesArea(area, `${row.description ?? ""} ${catName} ${(row.tags ?? []).join(" ")}`);
  };

  const entries = useMemo(
    () => (monthRows ?? []).filter(belongs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthRows, categoryName, slug],
  );

  const total = entries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const average = entries.length > 0 ? total / entries.length : 0;

  const history = useMemo(() => {
    const map = new Map<number, number>();
    for (let m = 1; m <= 12; m += 1) map.set(m, 0);
    for (const row of yearRows ?? []) {
      if (!belongs(row)) continue;
      const m = Number(row.transaction_date.slice(5, 7));
      map.set(m, (map.get(m) ?? 0) + Number(row.amount || 0));
    }
    return [...map.entries()].map(([m, value]) => ({
      month: m,
      label: MONTH_NAMES[m - 1].slice(0, 3),
      total: value,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearRows, categoryName, slug]);

  const yearTotal = history.reduce((sum, item) => sum + item.total, 0);

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          icon={Icon}
          eyebrow={area.eyebrow}
          title={area.label}
          description={area.description}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <PeriodPicker year={year} month={month} onChange={(next) => setPeriod(next)} />
              <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
                <Plus className="size-4" /> Lançar
              </Button>
            </div>
          }
        />

        <div className="grid gap-3 auto-cards-md">
          <StatTile
            tone="brand"
            label={`Total em ${MONTH_NAMES[month - 1]}`}
            value={formatCurrency(total)}
            icon={Wallet}
          />
          <StatTile
            tone="warning"
            label="Média por lançamento"
            value={formatCurrency(average)}
            icon={TrendingDown}
          />
          <StatTile
            tone="neutral"
            label={`Acumulado ${year}`}
            value={formatCurrency(yearTotal)}
            icon={Wallet}
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="text-sm font-semibold">Histórico de {year}</h2>
          <p className="text-xs text-muted-foreground">Compare o gasto deste serviço mês a mês.</p>
          <div className="mt-3 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                  {...axisProps}
                  width={56}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip
                  cursor={tooltipProps.cursor}
                  contentStyle={tooltipProps.contentStyle}
                  labelStyle={tooltipProps.labelStyle}
                  itemStyle={tooltipProps.itemStyle}
                  formatter={(value: number) => [formatCurrency(value), area.label]}
                />
                <Bar
                  dataKey="total"
                  fill={CHART_TOKENS.expense}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <h2 className="text-sm font-semibold">
              Lançamentos de {MONTH_NAMES[month - 1]} · {entries.length}
            </h2>
            <Button size="sm" variant="outline" asChild>
              <Link to="/lancamentos">
                <ArrowLeft className="size-4" /> Todos os lançamentos
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum gasto de {area.label.toLowerCase()} neste mês.
              </p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" /> Registrar agora
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{row.description}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(`${row.transaction_date}T00:00:00`)}
                        {row.category_id ? ` · ${categoryName.get(row.category_id) ?? ""}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatCurrency(Number(row.amount || 0))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <nav aria-label="Outras áreas de consumo" className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outras áreas
          </h2>
          <div className="mt-3 grid gap-2 auto-cards-md">
            {SERVICE_AREAS.filter((item) => item.slug !== area.slug).map((item) => (
              <Button
                key={item.slug}
                variant="outline"
                className="h-auto justify-start gap-2 py-2.5"
                asChild
              >
                <Link to="/consumo/$slug" params={{ slug: item.slug }}>
                  <item.icon className="size-4 text-brand" />
                  <span className="truncate text-sm">{item.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </nav>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kind="expense"
        defaultDate={range.start > new Date().toISOString().slice(0, 10) ? range.start : undefined}
      />

      <TransactionDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        transaction={editing}
        kind="expense"
      />
    </AppShell>
  );
}
