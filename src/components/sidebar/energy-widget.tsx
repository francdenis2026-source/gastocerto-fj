import { useEnergyBills } from "@/lib/energy";
import { formatCurrency } from "@/lib/format-utils";
import { Link } from "@tanstack/react-router";
import { Zap, AlertCircle, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRecurrentExpenses } from "@/functions/recurrent-metrics.functions";
import { cn } from "@/lib/utils";

export function EnergySidebarWidget({ collapsed }: { collapsed?: boolean }) {
  const { data: bills, isLoading: isLoadingEnergy } = useEnergyBills();
  const { data: recurrents, isLoading: isLoadingRecurrent } = useQuery({
    queryKey: ["recurrent-expenses-sidebar"],
    queryFn: () => getRecurrentExpenses()
  });

  const latestBill = bills?.[0];
  const lastMonthBill = bills?.[1];
  const isHigh = lastMonthBill ? latestBill!.amount > lastMonthBill.amount * 1.1 : false;

  const totalRecurrent = (recurrents ?? [])
    .filter(r => r.transaction_type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        {latestBill && (
          <Link 
            to="/energia"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors hover:bg-secondary/70",
              isHigh ? "text-orange-500" : "text-emerald-500"
            )}
            title={`Energia: ${formatCurrency(latestBill.amount)}`}
          >
            <Zap className="size-4" />
          </Link>
        )}
        {totalRecurrent > 0 && (
          <Link 
            to="/recorrencia"
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors hover:bg-secondary/70 text-brand"
            title={`Recorrentes: ${formatCurrency(totalRecurrent)}`}
          >
            <RefreshCw className="size-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-3">
      {latestBill && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Zap className="size-3 text-brand" />
              Energia
            </div>
            {isHigh ? (
              <div className="flex items-center gap-1 text-[9px] text-orange-500 font-bold uppercase">
                Atenção
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold uppercase">
                Ok
              </div>
            )}
          </div>
          <p className="text-base font-bold tabular-nums">
            {formatCurrency(latestBill.amount)}
          </p>
          <Link 
            to="/energia" 
            className="mt-2 flex items-center justify-between text-[10px] font-medium text-brand hover:underline"
          >
            Detalhes
            <ChevronRight className="size-3" />
          </Link>
        </div>
      )}

      {totalRecurrent > 0 && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <RefreshCw className="size-3 text-brand" />
            Recorrentes
          </div>
          <p className="text-base font-bold tabular-nums">
            {formatCurrency(totalRecurrent)}
          </p>
          <p className="text-[9px] text-muted-foreground mt-1">
            Gasto fixo mensal projetado
          </p>
          <Link 
            to="/recorrencia" 
            className="mt-2 flex items-center justify-between text-[10px] font-medium text-brand hover:underline"
          >
            Ver Agenda
            <ChevronRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
