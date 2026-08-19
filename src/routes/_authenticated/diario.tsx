import { createFileRoute, Link } from "@tanstack/react-router";
import { PeriodPicker } from "@/components/finance/period-picker";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarDays, Clock, ListFilter, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useCommitments, useCommitmentEntries, summarizeAll } from "@/lib/commitments";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/finance/page-header";
import { StatTile } from "@/components/finance/stat-tile";
import { TransactionDialog } from "@/components/finance/dialogs/transaction-dialog";
import { TransactionDetailsDialog } from "@/components/finance/dialogs/transaction-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHART_TOKENS, axisProps, gridProps, tooltipProps } from "@/lib/chart-theme";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useCategories } from "@/lib/queries";
import { useTransactions, type Transaction } from "@/lib/transactions";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({
    meta: [
      { title: "Gastos do dia — GastoCerto" },
      {
        name: "description",
        content:
          "Veja em detalhes os gastos de hoje com hora do lançamento, além dos totais quinzenais e mensais.",
      },
      { property: "og:title", content: "Gastos do dia — GastoCerto" },
      {
        property: "og:description",
        content: "Detalhe hora a hora dos seus gastos diários, quinzenais e mensais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DailyPage,
});

type Mode = "dia" | "semana" | "quinzena" | "mes";

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFor(mode: Mode, year: number, month: number) {
  const today = new Date();
  const dateInView = new Date(year, month - 1, 1);

  if (mode === "dia") {
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const targetDate = isCurrentMonth ? today : dateInView;
    return { start: iso(targetDate), end: iso(targetDate) };
  }

  if (mode === "semana") {
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const refDate = isCurrentMonth ? today : dateInView;
    const start = new Date(refDate);
    start.setDate(refDate.getDate() - refDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: iso(start), end: iso(end) };
  }

  if (mode === "quinzena") {
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const first = isCurrentMonth ? today.getDate() <= 15 : true;
    const start = new Date(year, month - 1, first ? 1 : 16);
    const end = first ? new Date(year, month - 1, 15) : new Date(year, month, 0);
    return { start: iso(start), end: iso(end) };
  }

  return { start: iso(dateInView), end: iso(new Date(year, month, 0)) };
}

function hourOf(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function DailyPage() {
  const [mode, setMode] = useState<Mode>("dia");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const range = useMemo(() => rangeFor(mode, selectedYear, selectedMonth), [mode, selectedYear, selectedMonth]);
  const { data: allTransactions, isLoading } = useTransactions(range);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<"date" | "category">("date");
  const [details, setDetails] = useState<Transaction | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { data: categories } = useCategories();

  const categoryName = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const term = search.trim().toLowerCase();
  const transactions = useMemo(
    () =>
      (allTransactions ?? []).filter((item) => {
        if (categoryFilter !== "all") {
          const matches = item.category_id === categoryFilter || item.sub_category_id === categoryFilter;
          if (!matches) return false;
        }
        if (!term) return true;
        return (
          item.description.toLowerCase().includes(term) ||
          (item.merchant_name ?? "").toLowerCase().includes(term) ||
          (item.notes ?? "").toLowerCase().includes(term)
        );
      }),
    [allTransactions, categoryFilter, term],
  );

  const expenses = transactions.filter((item) => item.transaction_type === "expense");
  const incomes = transactions.filter((item) => item.transaction_type === "income");
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = totalIncome - totalExpense;

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    expenses.forEach((item) => {
      const key =
        mode === "dia"
          ? (hourOf(item.created_at) ?? "—").slice(0, 2) + "h"
          : formatDate(item.transaction_date).slice(0, 5);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(item.amount));
    });
    return [...buckets.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [expenses, mode]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof expenses>();
    transactions.forEach((item) => {
      const list = map.get(item.transaction_date) ?? [];
      list.push(item);
      map.set(item.transaction_date, list);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const categoryGroups = useMemo(() => {
    const map = new Map<string, { total: number; count: number; items: typeof expenses }>();
    transactions.forEach((item) => {
      const key = item.category_id ?? "none";
      const entry = map.get(key) ?? { total: 0, count: 0, items: [] };
      entry.total += (item.transaction_type === "income" ? 1 : -1) * Number(item.amount);
      entry.count += 1;
      entry.items.push(item);
      map.set(key, entry);
    });
    return [...map.entries()].sort((a, b) => a[1].total - b[1].total);
  }, [transactions]);

  return (
    <AppShell>
      <div className="space-y-4">
        <DebtOverdueNotice />

        <PageHeader
          icon={ListFilter}
          eyebrow="Dia a dia"
          title="Gastos em detalhes"
          description={`${formatDate(range.start)} até ${formatDate(range.end)} · hora de cada lançamento`}
          actions={
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <PeriodPicker
                year={selectedYear}
                month={selectedMonth}
                onChange={(p) => {
                  setSelectedYear(p.year);
                  setSelectedMonth(p.month);
                }}
              />
              <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
                <TabsList className="max-w-full overflow-x-auto bg-muted/50 p-1">
                  <TabsTrigger value="dia">Dia</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="quinzena">Quinzena</TabsTrigger>
                  <TabsTrigger value="mes">Mês</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <Button variant="outline" size="sm" onClick={() => toast.info("Exportação CSV iniciada...")}>CSV</Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("Exportação PDF iniciada...")}>PDF</Button>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Adicionar gasto
                </Button>
              </div>
            </div>
          }
        />

        <section className="auto-cards-sm" aria-label="Resumo do período">
          <StatTile tone="danger" label="Saídas no período" value={formatCurrency(totalExpense)} hint={`${expenses.length} lançamento(s)`} icon={ArrowDownRight} />
          <StatTile tone="success" label="Entradas no período" value={formatCurrency(totalIncome)} hint={`${incomes.length} lançamento(s)`} icon={ArrowUpRight} />
          <StatTile tone={balance >= 0 ? "success" : "danger"} label="Resultado" value={formatCurrency(balance)} hint="Entradas menos saídas" icon={ListFilter} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="size-4 text-muted-foreground" />
            {mode === "dia" ? "Saídas por hora" : mode === "semana" ? "Saídas por dia da semana" : "Saídas por dia"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Distribuição das despesas no período selecionado.</p>
          <div className="chart-frame mt-3" role="img" aria-label="Gráfico de saídas no período">
            {chartData.length === 0 ? (
              <p className="grid h-full place-items-center text-sm text-muted-foreground">Sem gastos registrados neste período.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={54} />
                  <Tooltip {...tooltipProps} formatter={(value: number) => [formatCurrency(value), "Saídas"]} />
                  <Bar dataKey="total" fill={CHART_TOKENS.expense} radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <h2 className="text-sm font-semibold">Extrato detalhado</h2>
            <div className="flex w-full flex-wrap items-center gap-2 sm:ms-auto sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lançamento" aria-label="Buscar lançamento no extrato" className="w-full ps-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="min-w-40 flex-1 sm:w-48 sm:flex-none" aria-label="Filtrar por categoria">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {(categories ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Tabs value={groupBy} onValueChange={(value) => setGroupBy(value as typeof groupBy)}>
                <TabsList>
                  <TabsTrigger value="date">Por data</TabsTrigger>
                  <TabsTrigger value="category">Por categoria</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : groups.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Nenhum lançamento neste período. Use “Adicionar gasto” para registrar agora.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(groupBy === "category"
                ? categoryGroups.map(([key, entry]) => [key === "none" ? "Sem categoria" : (categoryName.get(key) ?? "Sem categoria"), entry.items] as const)
                : groups
              ).map(([date, items]) => (
                <li key={date}>
                  <div className="flex items-center justify-between gap-2 bg-muted/40 px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{groupBy === "category" ? date : formatDate(date)}</span>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatCurrency(items.reduce((sum, item) => sum + (item.transaction_type === "income" ? 1 : -1) * Number(item.amount), 0))}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {items.map((item) => {
                      const income = item.transaction_type === "income";
                      const time = hourOf(item.created_at);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setDetails(item)}
                            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
                            aria-label={`Abrir detalhes de ${item.description}, ${formatCurrency(Number(item.amount))}`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full ${income ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                                {income ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{item.description}</span>
                                <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                  {time ? <><Clock className="size-3" />{time}</> : null}
                                  {item.category_id ? <span className="truncate">· {categoryName.get(item.category_id) ?? "Sem categoria"}{item.sub_category_id ? ` › ${categoryName.get(item.sub_category_id) ?? ""}` : ""}</span> : null}
                                </span>
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {item.is_essential ? <Badge variant="secondary" className="hidden sm:inline-flex">Essencial</Badge> : null}
                              <span className={`text-sm font-semibold tabular-nums ${income ? "text-primary" : "text-foreground"}`}>{income ? "+" : "−"}{formatCurrency(Number(item.amount))}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {dialogOpen || editing ? (
        <TransactionDialog
          open={dialogOpen || Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) {
              setDialogOpen(false);
              setEditing(null);
            }
          }}
          transaction={editing}
          kind={editing?.transaction_type === "income" ? "income" : "expense"}
        />
      ) : null}

      <TransactionDetailsDialog
        transaction={details}
        open={Boolean(details)}
        onOpenChange={(open) => !open && setDetails(null)}
        onEdit={(row) => {
          setDetails(null);
          setEditing(row);
        }}
      />
    </AppShell>
  );
}

function DebtOverdueNotice() {
  const { data: commitments } = useCommitments();
  const { data: entries } = useCommitmentEntries();
  const summaries = useMemo(() => summarizeAll(commitments ?? [], entries ?? []), [commitments, entries]);
  const overdueItems = summaries.filter((s: any) => s.overdue && s.commitment.status === "open");
  if (overdueItems.length === 0) return null;
  const totalOverdue = overdueItems.reduce((sum: number, s: any) => sum + s.outstanding, 0);

  return (
    <section role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/20">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-bold text-destructive">Atenção: você possui {overdueItems.length} {overdueItems.length === 1 ? "dívida" : "dívidas"} em atraso</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            O valor total pendente é de <strong className="text-destructive">{formatCurrency(totalOverdue)}</strong>. Para regularizar, siga o checklist em <Link to="/pagar-dividas" className="font-semibold text-destructive underline underline-offset-4">Pagar Dívidas</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
