import { useEffect } from "react";
import { CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils";

export type MonthPeriod = { year: number; month: number };

const KEY_PREFIX = "gc.period.";

export function loadPeriod(scope: string): MonthPeriod | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${KEY_PREFIX}${scope}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MonthPeriod;
    if (typeof parsed?.year === "number" && typeof parsed?.month === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

function savePeriod(scope: string, period: MonthPeriod) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${KEY_PREFIX}${scope}`, JSON.stringify(period));
  } catch {
    // Segue sem persistência em contextos onde o armazenamento não está disponível.
  }
}

function shiftMonth(offset: number): MonthPeriod {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function MonthPresets({
  scope,
  value,
  onChange,
  className,
}: {
  scope: string;
  value: MonthPeriod;
  onChange: (period: MonthPeriod) => void;
  className?: string;
}) {
  useEffect(() => {
    savePeriod(scope, value);
  }, [scope, value]);

  const options = [
    { label: "Este mês", period: shiftMonth(0) },
    { label: "Mês anterior", period: shiftMonth(-1) },
    { label: "2 meses atrás", period: shiftMonth(-2) },
    { label: "3 meses atrás", period: shiftMonth(-3) },
  ];

  return (
    <section
      className={cn(
        "grid gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-soft",
        className,
      )}
      aria-label="Períodos rápidos"
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <CalendarRange className="size-3.5" aria-hidden="true" />
        </span>
        Períodos rápidos
      </p>
      <div
        role="group"
        aria-label="Atalhos de período"
        className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option) => {
          const active =
            option.period.year === value.year && option.period.month === value.month;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.period)}
              className={cn(
                "min-h-11 shrink-0 rounded-xl border px-3.5 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary/45 bg-primary/12 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/35 hover:bg-accent",
              )}
            >
              {option.label}
              <span className={cn("ml-1 text-[10px]", active ? "text-primary/80" : "text-muted-foreground")}>
                {MONTH_LABELS[option.period.month - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
