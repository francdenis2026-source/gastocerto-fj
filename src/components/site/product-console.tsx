import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const months = [
  { label: "Jan", value: 48 },
  { label: "Fev", value: 62 },
  { label: "Mar", value: 55 },
  { label: "Abr", value: 71 },
  { label: "Mai", value: 64 },
  { label: "Jun", value: 83 },
  { label: "Jul", value: 76 },
  { label: "Ago", value: 94 },
];

const entries = [
  { title: "Mercado do Bairro", tag: "Alimentação", value: "-412,90", day: "04 ago" },
  { title: "Salário", tag: "Receita fixa", value: "+6.480,00", day: "01 ago", positive: true },
  { title: "Posto Central", tag: "Combustível", value: "-289,40", day: "31 jul" },
  { title: "Energia Elétrica", tag: "Casa", value: "-176,55", day: "29 jul" },
];

/**
 * Vitrine do produto: composição real de dados financeiros, sem wireframes
 * nem blocos vazios. Tipografia monoespaçada nos valores.
 */
export function ProductConsole({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-navy-800/80 backdrop-blur-md",
        "shadow-[0_80px_160px_-50px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-bone-100/40">
            Visão geral
          </p>
          <p className="mt-1 font-display text-[15px] font-semibold text-bone-100">Agosto 2026</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-bone-100/55">
            Sincronizado
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-3">
        {[
          { label: "Saldo do mês", value: "R$ 4.318,72", trend: "+12,4%", up: true },
          { label: "Receitas", value: "R$ 6.480,00", trend: "estável", up: true },
          { label: "Despesas", value: "R$ 2.161,28", trend: "-8,1%", up: false },
        ].map((item) => (
          <div key={item.label} className="bg-navy-700 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone-100/40">
              {item.label}
            </p>
            <p className="numeric mt-2 text-[22px] font-semibold text-bone-100">{item.value}</p>
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 text-[12px] font-semibold",
                item.up ? "text-brand-300" : "text-bone-100/50",
              )}
            >
              {item.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {item.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-6 py-6">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-[15px] font-semibold text-bone-100">
            Evolução da economia
          </p>
          <p className="numeric text-[12px] text-bone-100/45">últimos 8 meses</p>
        </div>
        <div className="mt-6 flex h-28 items-end gap-2 sm:gap-3">
          {months.map((month, i) => (
            <div
              key={month.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className={cn(
                  "w-full rounded-t-[3px]",
                  i === months.length - 1 ? "bg-primary" : "bg-brand-400/25",
                )}
                style={{ height: `${month.value}%` }}
              />
              <span className="numeric text-[10px] text-bone-100/35">{month.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        {entries.map((entry) => (
          <div
            key={entry.title}
            className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-bone-100/90">{entry.title}</p>
              <p className="text-[11px] font-medium text-bone-100/40">
                {entry.tag} · {entry.day}
              </p>
            </div>
            <p
              className={cn(
                "numeric shrink-0 text-[14px] font-semibold",
                entry.positive ? "text-brand-300" : "text-bone-100/70",
              )}
            >
              {entry.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-navy-600/60 px-6 py-4">
        <p className="text-[12px] font-medium text-bone-100/55">
          Projeção de fechamento: <span className="numeric text-bone-100">R$ 4.902,10</span>
        </p>
        <ArrowUpRight className="size-4 text-primary" />
      </div>
    </div>
  );
}
