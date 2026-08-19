import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, RefreshCw, Zap } from "lucide-react";

import { useEnergyBills } from "@/lib/energy";
import { formatCurrency } from "@/lib/format-utils";
import { getRecurrentExpenses } from "@/lib/recurrent-metrics.functions";
import { cn } from "@/lib/utils";

export function EnergySidebarWidget({ collapsed }: { collapsed?: boolean }) {
  const { data: bills } = useEnergyBills();
  const { data: recurrents } = useQuery({
    queryKey: ["recurrent-expenses-sidebar"],
    queryFn: () => getRecurrentExpenses(),
  });

  const latestBill = bills?.[0];
  const lastMonthBill = bills?.[1];
  const isHigh = Boolean(
    latestBill && lastMonthBill && latestBill.amount > lastMonthBill.amount * 1.1,
  );

  const totalRecurrent = (recurrents ?? [])
    .filter((row) => row.transaction_type === "expense")
    .reduce((sum, row) => sum + Number(row.amount), 0);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        {latestBill ? (
          <Link
            to="/energia"
            aria-label={`Energia: ${formatCurrency(latestBill.amount)}. Ver detalhes.`}
            className={cn(
              "grid min-h-11 min-w-11 place-items-center rounded-xl transition-colors hover:bg-muted motion-reduce:transition-none",
              isHigh ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400",
            )}
            title={`Energia: ${formatCurrency(latestBill.amount)}`}
          >
            <Zap className="size-5" aria-hidden="true" />
          </Link>
        ) : null}

        {totalRecurrent > 0 ? (
          <Link
            to="/recorrencia"
            aria-label={`Gastos recorrentes: ${formatCurrency(totalRecurrent)}. Ver agenda.`}
            className="grid min-h-11 min-w-11 place-items-center rounded-xl text-primary transition-colors hover:bg-muted motion-reduce:transition-none"
            title={`Recorrentes: ${formatCurrency(totalRecurrent)}`}
          >
            <RefreshCw className="size-5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-3 py-2">
      {latestBill ? (
        <section className="rounded-xl border border-border bg-muted/35 p-3" aria-label="Resumo de energia">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Zap className="size-4 text-primary" aria-hidden="true" />
              Energia
            </div>
            <span
              className={cn(
                "text-xs font-bold uppercase",
                isHigh ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {isHigh ? "Atenção" : "Ok"}
            </span>
          </div>
          <p className="text-base font-bold tabular-nums">{formatCurrency(latestBill.amount)}</p>
          <Link
            to="/energia"
            className="mt-2 flex min-h-10 items-center justify-between rounded-lg px-1 text-xs font-semibold text-primary transition-colors hover:bg-muted hover:underline motion-reduce:transition-none"
          >
            Detalhes
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {totalRecurrent > 0 ? (
        <section className="rounded-xl border border-border bg-muted/35 p-3" aria-label="Resumo de gastos recorrentes">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <RefreshCw className="size-4 text-primary" aria-hidden="true" />
            Recorrentes
          </div>
          <p className="text-base font-bold tabular-nums">{formatCurrency(totalRecurrent)}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Gasto fixo mensal projetado</p>
          <Link
            to="/recorrencia"
            className="mt-2 flex min-h-10 items-center justify-between rounded-lg px-1 text-xs font-semibold text-primary transition-colors hover:bg-muted hover:underline motion-reduce:transition-none"
          >
            Ver agenda
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
