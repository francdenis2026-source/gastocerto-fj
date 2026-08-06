import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Fuel,
  ShoppingCart,
  Utensils,
  Zap,
} from "lucide-react";

import { PreviewChart } from "@/components/landing/preview-chart";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format-utils";
import { cn } from "@/lib/utils";


const topCategories = [
  { name: "Alimentação", value: 1284.9, percent: 34, icon: Utensils },
  { name: "Combustível", value: 742.3, percent: 20, icon: Fuel },
  { name: "Supermercado", value: 618.75, percent: 16, icon: ShoppingCart },
  { name: "Energia", value: 289.4, percent: 8, icon: Zap },
];

const upcomingBills = [
  { name: "Internet fibra", date: "2026-08-05", value: 119.9 },
  { name: "Academia", date: "2026-08-08", value: 89.9 },
  { name: "Financiamento", date: "2026-08-10", value: 742.0 },
];

const lastEntries = [
  { name: "Posto Ipiranga", category: "Combustível", value: -212.4, date: "2026-07-29" },
  { name: "Salário", category: "Receita", value: 4800, date: "2026-07-28" },
  { name: "Supermercado Dia", category: "Supermercado", value: -186.32, date: "2026-07-27" },
];

function PreviewCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tabular mt-0.5 text-[13px] font-black tracking-tight",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="Prévia do painel do GastoCerto com total gasto no mês, saldo, orçamento, gráfico de despesas, categorias, abastecimentos, próximas contas e últimos lançamentos"
      className="rounded-2xl border border-white/5 bg-[#001640]/40 p-3 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Julho de 2026</p>
          <p className="text-sm font-semibold">Olá, Marina</p>
        </div>
        <span className="relative grid size-8 place-items-center rounded-lg border border-border">
          <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-destructive" />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <PreviewCard label="Gasto" value={formatCurrency(3782)} tone="negative" />
        <PreviewCard label="Saldo" value={formatCurrency(2417)} tone="positive" />
        <PreviewCard label="Meta" value="92%" />
      </div>


      <PreviewChart className="mt-2.5" />




      <div className="mt-2.5 space-y-1.5">
        {topCategories.slice(0, 2).map((cat) => (
          <div key={cat.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2 py-1.5 text-[11px]">
            <span className="flex items-center gap-2 font-medium text-white/90">
              <cat.icon className="size-3 text-brand" />
              {cat.name}
            </span>
            <span className="font-bold text-white">{formatCurrency(cat.value)}</span>
          </div>
        ))}
      </div>


    </div>
  );
}
