import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownRight,
  ArrowUpRight,
  Baby,
  FileDown,
  FileText,
  Loader2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-utils";
import { useDependents } from "@/lib/dependents";
import { getKidTransactions } from "@/functions/kids-transactions.functions";
import {
  exportKidsSummaryCsv,
  exportKidsSummaryPdf,
  type KidExportRow,
} from "@/lib/kids-export";
import { cn } from "@/lib/utils";


type PeriodKey = "30" | "90" | "365" | "all";

const PERIOD_LABELS: Record<PeriodKey, string> = {
  "30": "Últimos 30 dias",
  "90": "Últimos 90 dias",
  "365": "Últimos 12 meses",
  all: "Todo o período",
};

const TYPE_LABELS: Record<"all" | "expense" | "income", string> = {
  all: "Gastos e entradas",
  expense: "Somente gastos",
  income: "Somente entradas",
};


/**
 * Resumo de gastos e movimentações por criança, com filtros e atualização
 * em tempo real, exibido no painel Meu Perfil.
 */
export function KidsSpendingSummary() {
  const dependents = useDependents();
  const queryClient = useQueryClient();
  const kids = useMemo(
    () => (dependents.data ?? []).filter((item) => item.active !== false),
    [dependents.data],
  );

  const [kidId, setKidId] = useState<string>("");
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [type, setType] = useState<"all" | "expense" | "income">("all");

  useEffect(() => {
    if (!kidId && kids.length > 0) setKidId(kids[0]!.id);
  }, [kids, kidId]);

  const fetchTxns = useServerFn(getKidTransactions);
  const { data, isLoading } = useQuery({
    queryKey: ["kid-transactions-parent", kidId],
    enabled: Boolean(kidId),
    queryFn: () => fetchTxns({ data: { dependentId: kidId } }),
  });

  useEffect(() => {
    const channel = supabase
      .channel("perfil-kids-transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => queryClient.invalidateQueries({ queryKey: ["kid-transactions-parent"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const rows = useMemo(() => {
    const list = (data ?? []) as Array<Record<string, any>>;
    const limit =
      period === "all" ? null : Date.now() - Number(period) * 24 * 60 * 60 * 1000;
    return list.filter((row) => {
      if (type !== "all" && row["transaction_type"] !== type) return false;
      if (limit === null) return true;
      return new Date(`${row["transaction_date"]}T12:00:00`).getTime() >= limit;
    });
  }, [data, period, type]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    rows.forEach((row) => {
      const value = Number(row["amount"] ?? 0);
      if (row["transaction_type"] === "income") income += value;
      else expense += value;
    });
    return { income, expense, balance: income - expense, count: rows.length };
  }, [rows]);

  const selectedKid = kids.find((kid) => kid.id === kidId);
  const [exporting, setExporting] = useState(false);

  const exportRows: KidExportRow[] = useMemo(
    () =>
      rows.map((row) => ({
        date: String(row["transaction_date"]),
        description: String(row["description"] ?? "Movimentação"),
        type: row["transaction_type"] === "income" ? "income" : "expense",
        amount: Number(row["amount"] ?? 0),
      })),
    [rows],
  );

  const exportFilters = {
    kidName: selectedKid?.name ?? "Criança",
    periodLabel: PERIOD_LABELS[period],
    typeLabel: TYPE_LABELS[type],
  };

  function handleCsv() {
    exportKidsSummaryCsv(exportRows, totals, exportFilters);
    toast.success("CSV gerado com os filtros aplicados.");
  }

  async function handlePdf() {
    setExporting(true);
    try {
      await exportKidsSummaryPdf(exportRows, totals, exportFilters);
      toast.success("PDF gerado com os filtros aplicados.");
    } catch {
      toast.error("Não foi possível gerar o PDF agora.");
    } finally {
      setExporting(false);
    }
  }


  if (dependents.isLoading) {
    return (
      <div className="flex justify-center py-10" role="status" aria-live="polite">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="sr-only">Carregando crianças</span>
      </div>
    );
  }

  if (kids.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Cadastre uma criança em “Meus cadastros” para acompanhar os gastos dela por aqui.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="kids-summary-child" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Criança
          </Label>
          <Select value={kidId} onValueChange={setKidId}>
            <SelectTrigger id="kids-summary-child" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {kids.map((kid) => (
                <SelectItem key={kid.id} value={kid.id}>
                  {kid.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kids-summary-period" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Período
          </Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
            <SelectTrigger id="kids-summary-period" className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PERIOD_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kids-summary-type" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo
          </Label>
          <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
            <SelectTrigger id="kids-summary-type" className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tudo</SelectItem>
              <SelectItem value="expense">Somente gastos</SelectItem>
              <SelectItem value="income">Somente entradas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <ArrowDownRight className="size-3.5 text-destructive" aria-hidden /> Gastos
          </p>
          <p className="mt-1 text-xl font-extrabold tabular-nums">{formatCurrency(totals.expense)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <ArrowUpRight className="size-3.5 text-primary" aria-hidden /> Entradas
          </p>
          <p className="mt-1 text-xl font-extrabold tabular-nums">{formatCurrency(totals.income)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Wallet className="size-3.5 text-primary" aria-hidden /> Saldo
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-extrabold tabular-nums",
              totals.balance < 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {formatCurrency(totals.balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
        <p className="min-w-0 text-[12px] text-muted-foreground">
          As exportações usam exatamente os filtros selecionados acima.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-[11px] font-semibold"
            onClick={handleCsv}
            aria-label={`Exportar resumo de ${exportFilters.kidName} em CSV`}
          >
            <FileDown className="size-3.5" aria-hidden /> CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-[11px] font-semibold"
            onClick={handlePdf}
            disabled={exporting}
            aria-label={`Exportar resumo de ${exportFilters.kidName} em PDF`}
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <FileText className="size-3.5" aria-hidden />
            )}
            PDF
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border p-3 sm:flex sm:justify-between">
          <h3 className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-foreground">
            <Baby className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{selectedKid?.name ?? "Criança"} · movimentações</span>
          </h3>
          <Badge variant="outline" className="shrink-0 text-[11px] text-foreground">
            {totals.count} registro(s)
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6" role="status" aria-live="polite">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="sr-only">Carregando movimentações</span>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-muted-foreground">
            Nenhuma movimentação encontrada com os filtros atuais.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={String(row["id"])} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {row["description"]}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(`${row["transaction_date"]}T12:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-[13px] font-bold tabular-nums",
                    row["transaction_type"] === "income" ? "text-primary" : "text-destructive",
                  )}
                >
                  {row["transaction_type"] === "income" ? "+" : "−"}{" "}
                  {formatCurrency(Number(row["amount"] ?? 0))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
