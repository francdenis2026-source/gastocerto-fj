import { useEnergyBills } from "@/lib/energy";
import { formatCurrency } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Zap, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function EnergySidebarWidget({ collapsed }: { collapsed?: boolean }) {
  const { data: bills, isLoading } = useEnergyBills();
  
  if (isLoading || !bills || bills.length === 0) return null;
  
  const latestBill = bills[0];
  const lastMonthBill = bills[1];
  
  const isHigh = lastMonthBill ? latestBill.amount > lastMonthBill.amount * 1.1 : false;
  
  if (collapsed) {
    return (
      <Link 
        to="/energia"
        className={cn(
          "flex flex-col items-center gap-1 py-2 rounded-xl transition-colors hover:bg-secondary/70",
          isHigh ? "text-orange-500" : "text-emerald-500"
        )}
      >
        <Zap className="size-4" />
        <span className="text-[10px] font-bold">{latestBill.consumption_kwh}kwh</span>
      </Link>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Zap className="size-3 text-brand" />
          Energia
        </div>
        {isHigh ? (
          <div className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
            <AlertCircle className="size-3" />
            Atenção
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <CheckCircle2 className="size-3" />
            Normal
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-lg font-bold tabular-nums">
          {formatCurrency(latestBill.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Consumo: <span className="font-medium text-foreground">{latestBill.consumption_kwh} kWh</span>
        </p>
      </div>

      <Link 
        to="/energia" 
        className="mt-3 flex items-center justify-between text-[10px] font-medium text-brand hover:underline"
      >
        Ver detalhes
        <ChevronRight className="size-3" />
      </Link>
    </div>
  );
}
