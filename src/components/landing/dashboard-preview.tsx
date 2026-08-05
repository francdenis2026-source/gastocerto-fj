import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Fuel,
  ShoppingCart,
  Utensils,
  Zap,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const chartBars = [
  { day: "01", value: 42 },
  { day: "05", value: 68 },
  { day: "09", value: 35 },
  { day: "12", value: 82 },
  { day: "15", value: 54 },
  { day: "19", value: 96 },
  { day: "22", value: 61 },
  { day: "26", value: 74 },
  { day: "29", value: 48 },
];

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


      {/* Gráfico profissional: área com gradiente, grade e eixo de dias. */}
      <div className="mt-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Despesas diárias
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Julho
          </span>
        </div>
        <svg viewBox="0 0 240 72" className="h-20 w-full" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dp-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand, #54A860)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--brand, #54A860)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="0"
              x2="240"
              y1={6 + line * 15}
              y2={6 + line * 15}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="3 4"
              className="text-white/10"
            />
          ))}
          {(() => {
            const pts = chartBars.map((bar, index) => ({
              x: (index / (chartBars.length - 1)) * 236 + 2,
              y: 66 - (bar.value / 100) * 58,
            }));
            const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <>
                <polygon points={`2,66 ${line} 238,66`} fill="url(#dp-area)" />
                <polyline
                  points={line}
                  fill="none"
                  stroke="var(--brand, #54A860)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {pts.map((p) => (
                  <circle key={p.x} cx={p.x} cy={p.y} r="1.8" fill="var(--brand, #54A860)" />
                ))}
              </>
            );
          })()}
        </svg>
        <div className="mt-1 flex justify-between text-[9px] font-medium tabular-nums text-muted-foreground">
          {chartBars.map((bar) => (
            <span key={bar.day}>{bar.day}</span>
          ))}
        </div>
      </div>



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
