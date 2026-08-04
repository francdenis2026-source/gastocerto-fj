import { useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { usePeriodStore } from "@/lib/period-store";
import { useTransactions } from "@/lib/transactions";
import { monthRange, isoDate, MONTH_NAMES } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractiveCalendarProps {
  onDayClick: (day: number) => void;
}

export function InteractiveCalendar({ onDayClick }: InteractiveCalendarProps) {
  const { year, month, setPeriod } = usePeriodStore();
  const range = monthRange(year, month);
  const { data: transactions } = useTransactions(range);
  const today = isoDate(new Date());

  const days = useMemo(() => {
    const list = [];
    for (let d = 1; d <= range.days; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTransactions = (transactions ?? []).filter(t => t.transaction_date === dateStr);
      
      const income = dayTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = dayTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      list.push({
        day: d,
        date: dateStr,
        isToday: dateStr === today,
        income,
        expense,
        count: dayTransactions.length
      });
    }
    return list;
  }, [year, month, range.days, transactions, today]);

  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setPeriod({ year: d.getFullYear(), month: d.getMonth() + 1 });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-soft lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 sm:p-4">
      <div className="space-y-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-brand" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Calendário de Fluxo</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => shift(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-bold min-w-[100px] text-center">
              {MONTH_NAMES[month-1]} {year}
            </span>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => shift(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="pb-2 text-center text-[10px] font-bold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
          
          {days.map(d => (
            <button
              key={d.day}
              onClick={() => onDayClick(d.day)}
              className={cn(
                "group relative flex flex-col items-center justify-between rounded-lg border border-border/40 p-1 transition-all hover:border-brand/50 hover:bg-brand/5 sm:p-1.5 sm:rounded-xl",
                d.isToday && "border-brand bg-brand/5 ring-1 ring-brand/20",
                d.count === 0 && "opacity-60"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold",
                d.isToday ? "text-brand" : "text-muted-foreground"
              )}>
                {d.day}
              </span>
              
              <div className="mt-1 flex flex-col gap-0.5 w-full">
                {d.income > 0 && (
                  <div className="h-1 w-full rounded-full bg-income" title={`Receita: ${formatCurrency(d.income)}`} />
                )}
                {d.expense > 0 && (
                  <div className="h-1 w-full rounded-full bg-expense" title={`Despesa: ${formatCurrency(d.expense)}`} />
                )}
              </div>
              
              {d.count > 0 && (
                <div className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  {d.count}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 lg:mt-0 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6 space-y-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Legenda</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-income" />
              <span className="text-[11px] font-bold">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-expense" />
              <span className="text-[11px] font-bold">Despesas</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
              <Info className="size-3 text-brand" />
              <span className="text-[10px] text-muted-foreground italic leading-tight">Clique em um dia para lançar ou ver detalhes.</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Resumo Diário</h3>
          <div className="max-h-[200px] overflow-y-auto pr-2 scrollbar-thin space-y-2">
            {days.filter(d => d.count > 0).slice(-5).reverse().map(d => (
              <div key={d.day} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                <span className="text-[10px] font-bold">{d.day}/{month}</span>
                <div className="flex gap-2">
                  {d.income > 0 && <span className="text-[10px] font-black text-income">+{formatCurrency(d.income)}</span>}
                  {d.expense > 0 && <span className="text-[10px] font-black text-expense">-{formatCurrency(d.expense)}</span>}
                </div>
              </div>
            ))}
            {days.filter(d => d.count > 0).length === 0 && (
              <p className="text-[10px] text-muted-foreground italic text-center py-4">Sem registros este mês.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
