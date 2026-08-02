import { useMemo } from "react";
import { useEnergyBills } from "@/lib/energy";
import { toCents } from "@/lib/finance";

export function useEnergyInsights() {
  const { data: bills = [] } = useEnergyBills();

  const sorted = useMemo(() => [...bills].sort((a, b) => a.bill_date.localeCompare(b.bill_date)), [bills]);

  const stats = useMemo(() => {
    if (sorted.length === 0) return null;
    
    const last = sorted[sorted.length - 1];
    const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    
    const avgConsumption = sorted.reduce((sum, b) => sum + Number(b.consumption_kwh), 0) / sorted.length;
    const avgAmount = sorted.reduce((sum, b) => sum + Number(b.amount), 0) / sorted.length;
    
    let variation = 0;
    if (prev) {
      variation = ((Number(last.consumption_kwh) - Number(prev.consumption_kwh)) / Number(prev.consumption_kwh)) * 100;
    }

    return {
      last,
      avgConsumption,
      avgAmount,
      variation,
      totalCount: sorted.length
    };
  }, [sorted]);

  return { sorted, stats };
}
