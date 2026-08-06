import { useState, useMemo } from "react";
import { useTransactions } from "@/lib/transactions";
import { useDependents, dependentIdFromTags } from "@/lib/dependents";
import { formatCurrency } from "@/lib/format-utils";
import { periodDefaultDate, monthRange } from "@/lib/finance";
import { CHART_TOKENS, axisProps, gridProps, tooltipProps } from "@/lib/chart-theme";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Filter, Calendar, ChevronRight, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function FamilySpendingDashboard() {
  const [year] = useState(new Date().getFullYear());
  const [month] = useState(new Date().getMonth() + 1);
  const [filterBeneficiary, setFilterBeneficiary] = useState<string>("all");

  const range = monthRange(year, month);
  const { data: transactions } = useTransactions(range);
  const { data: dependents } = useDependents();

  const familyData = useMemo(() => {
    if (!transactions) return [];

    const map = new Map<string, { id: string; name: string; total: number; count: number }>();
    
    // Inicializa com dependentes conhecidos
    dependents?.forEach(d => {
      map.set(d.id, { id: d.id, name: d.nickname || d.name, total: 0, count: 0 });
    });

    transactions.forEach(tx => {
      if (tx.transaction_type !== "expense") return;
      const depId = dependentIdFromTags(tx.tags);
      if (depId) {
        const current = map.get(depId) || { id: depId, name: "Desconhecido", total: 0, count: 0 };
        current.total += Number(tx.amount);
        current.count += 1;
        map.set(depId, current);
      }
    });

    return Array.from(map.values())
      .filter(d => d.total > 0 || filterBeneficiary === "all" || d.id === filterBeneficiary)
      .sort((a, b) => b.total - a.total);
  }, [transactions, dependents, filterBeneficiary]);

  const totalFamilySpending = familyData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <Users className="size-5 text-brand" />
            Gastos Familiares
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Resumo de investimentos por dependente neste mês
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 font-bold">
            {formatCurrency(totalFamilySpending)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={familyData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid {...gridProps} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                {...axisProps}
                width={80}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                {...tooltipProps}
                formatter={(value: number) => [formatCurrency(value), "Total"]}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32}>
                {familyData.map((entry, index) => (
                  <Cell key={index} fill={index === 0 ? "var(--brand)" : "var(--brand-80)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {familyData.map((dep) => (
            <div key={dep.id} className="group relative flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 p-4 transition-all hover:bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{dep.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {dep.count} lançamentos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-foreground">{formatCurrency(dep.total)}</p>
                <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted/60">
                  <div 
                    className="h-full bg-brand transition-all duration-1000" 
                    style={{ width: `${(dep.total / totalFamilySpending) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
