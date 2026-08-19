import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatDate } from "@/lib/format-utils";
import { buildFuelCycles, round, type FuelEntry } from "@/lib/vehicles";

function percentChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return round(((current - previous) / previous) * 100, 1);
}

function variationLabel(value: number | null, higherIsBetter: boolean) {
  if (value == null) return "Sem ciclo anterior";
  if (value === 0) return "Sem mudança";
  const improved = higherIsBetter ? value > 0 : value < 0;
  return `${improved ? "Melhorou" : "Piorou"} ${Math.abs(value)}%`;
}

function currentCycle(entries: FuelEntry[]) {
  const ordered = entries
    .slice()
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date) || Number(a.odometer) - Number(b.odometer));

  if (ordered.length === 0) return null;

  const latest = ordered[ordered.length - 1];
  const latestFullIndex = ordered.findLastIndex((entry) => entry.full_tank === true);
  if (latestFullIndex < 0) return null;

  const baseline = ordered[latestFullIndex];
  const afterBaseline = ordered.slice(latestFullIndex + 1);
  const end = afterBaseline[afterBaseline.length - 1] ?? baseline;
  const distance = Math.max(0, Number(end.odometer) - Number(baseline.odometer));
  const liters = afterBaseline.reduce((sum, entry) => sum + Number(entry.liters ?? 0), 0);
  const cost = afterBaseline.reduce((sum, entry) => sum + Number(entry.total_amount ?? 0), 0);

  return {
    baseline,
    latest,
    end,
    distance: round(distance, 1),
    liters: round(liters, 3),
    cost: round(cost, 2),
    closed: end.id !== baseline.id && end.full_tank === true,
  };
}

export function FuelCycleChart({ entries }: { entries: FuelEntry[] }) {
  const cycles = useMemo(() => buildFuelCycles(entries), [entries]);
  const live = useMemo(() => currentCycle(entries), [entries]);

  const data = useMemo(
    () =>
      cycles
        .slice()
        .sort((a, b) => a.endDate.localeCompare(b.endDate))
        .map((cycle) => ({
          date: cycle.endDate,
          label: formatDate(cycle.endDate),
          consumption: cycle.consumption,
          costPerKm: cycle.costPerKm,
          litersPer100Km: cycle.consumption > 0 ? round(100 / cycle.consumption, 2) : null,
          costPer100Km: cycle.costPerKm > 0 ? round(cycle.costPerKm * 100, 2) : null,
          averagePrice: cycle.averagePrice,
          distance: cycle.distance,
          liters: cycle.liters,
          cost: cycle.cost,
          startDate: cycle.startDate,
          startOdometer: cycle.startOdometer,
          endOdometer: cycle.endOdometer,
        })),
    [cycles],
  );

  const comparison = useMemo(() => {
    if (data.length < 2) return null;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return {
      current,
      previous,
      consumptionChange: percentChange(current.consumption, previous.consumption),
      costPerKmChange: percentChange(current.costPerKm, previous.costPerKm),
      litersPer100KmChange:
        current.litersPer100Km != null && previous.litersPer100Km != null
          ? percentChange(current.litersPer100Km, previous.litersPer100Km)
          : null,
      costPer100KmChange:
        current.costPer100Km != null && previous.costPer100Km != null
          ? percentChange(current.costPer100Km, previous.costPer100Km)
          : null,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="space-y-3">
        {live ? (
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Referência de consumo encontrada</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tanque cheio em {formatDate(live.baseline.entry_date)} · odômetro {live.baseline.odometer} km.
                </p>
              </div>
              <span className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-xs font-medium text-primary">
                Ciclo em andamento
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Odômetro atual</span><strong className="mt-1 block tabular-nums">{live.end.odometer} km</strong></div>
              <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Km desde a referência</span><strong className="mt-1 block tabular-nums">{live.distance} km</strong></div>
              <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Litros após a referência</span><strong className="mt-1 block tabular-nums">{live.liters} L</strong></div>
              <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Gasto após a referência</span><strong className="mt-1 block tabular-nums">{formatCurrency(live.cost)}</strong></div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              A distância e os valores já podem ser auditados. A média km/l só é publicada quando um abastecimento posterior também termina com o tanque cheio, porque antes disso não é possível saber com precisão quanto combustível foi efetivamente consumido.
            </p>
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <div>
              <p className="text-sm font-semibold">Nenhuma referência de tanque cheio encontrada</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                Abra o abastecimento que iniciou a medição e confirme que ele está marcado como tanque cheio.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Último ciclo auditado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(latest.startDate)} ({latest.startOdometer} km) → {latest.label} ({latest.endOdometer} km)
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Ciclo completo
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Consumo atual</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{latest.consumption} km/l</p>
          <p className="mt-1 text-xs text-muted-foreground">{variationLabel(comparison?.consumptionChange ?? null, true)}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Litros / 100 km</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{latest.litersPer100Km != null ? `${latest.litersPer100Km} L` : "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{variationLabel(comparison?.litersPer100KmChange ?? null, false)}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Custo / 100 km</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{latest.costPer100Km != null ? formatCurrency(latest.costPer100Km) : "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{variationLabel(comparison?.costPer100KmChange ?? null, false)}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Preço médio do ciclo</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(latest.averagePrice)}/L</p>
          <p className="mt-1 text-xs text-muted-foreground">{latest.distance} km · {latest.liters} L · {formatCurrency(latest.cost)}</p>
        </div>
      </div>

      {comparison ? (
        <div className="rounded-xl border border-border bg-card p-3 text-sm">
          <p className="font-semibold">Comparação com o ciclo anterior</p>
          <div className="mt-2 grid gap-2 text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span>Consumo: <strong className="text-foreground">{comparison.previous.consumption} → {comparison.current.consumption} km/l</strong></span>
            <span>R$/km: <strong className="text-foreground">{formatCurrency(comparison.previous.costPerKm)} → {formatCurrency(comparison.current.costPerKm)}</strong></span>
            <span>L/100 km: <strong className="text-foreground">{comparison.previous.litersPer100Km ?? "—"} → {comparison.current.litersPer100Km ?? "—"}</strong></span>
            <span>R$/100 km: <strong className="text-foreground">{comparison.previous.costPer100Km != null ? formatCurrency(comparison.previous.costPer100Km) : "—"} → {comparison.current.costPer100Km != null ? formatCurrency(comparison.current.costPer100Km) : "—"}</strong></span>
          </div>
        </div>
      ) : null}

      <div className="h-72 w-full" role="img" aria-label="Evolução do consumo de combustível e custo por quilômetro por ciclo completo">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis yAxisId="consumption" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={42} unit=" km/l" />
            <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={54} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-xl">
                    <p className="font-semibold">Ciclo {formatDate(item.startDate)} → {item.label}</p>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <p>Odômetro: <strong className="text-foreground">{item.startOdometer} → {item.endOdometer} km</strong></p>
                      <p>Distância: <strong className="text-foreground">{item.distance} km</strong></p>
                      <p>Consumo: <strong className="text-foreground">{item.consumption} km/l</strong></p>
                      <p>Litros/100 km: <strong className="text-foreground">{item.litersPer100Km ?? "—"}</strong></p>
                      <p>Custo/km: <strong className="text-foreground">{formatCurrency(item.costPerKm)}</strong></p>
                      <p>Custo/100 km: <strong className="text-foreground">{item.costPer100Km != null ? formatCurrency(item.costPer100Km) : "—"}</strong></p>
                      <p>Preço médio/L: <strong className="text-foreground">{formatCurrency(item.averagePrice)}</strong></p>
                      <p>Combustível: <strong className="text-foreground">{item.liters} L</strong></p>
                      <p>Gasto do ciclo: <strong className="text-foreground">{formatCurrency(item.cost)}</strong></p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="consumption" type="monotone" dataKey="consumption" name="Consumo (km/l)" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line yAxisId="cost" type="monotone" dataKey="costPerKm" name="Custo por km (R$)" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
