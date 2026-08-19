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
  if (value == null) return "Sem comparação";
  if (value === 0) return "Sem mudança";
  const improved = higherIsBetter ? value > 0 : value < 0;
  return `${improved ? "Melhorou" : "Piorou"} ${Math.abs(value)}%`;
}

export function FuelCycleChart({ entries }: { entries: FuelEntry[] }) {
  const data = useMemo(
    () =>
      buildFuelCycles(entries)
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
        })),
    [entries],
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
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <div>
          <p className="text-sm font-semibold">Aguardando o primeiro ciclo completo</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
            Registre um abastecimento com tanque cheio como referência e, depois, um novo tanque cheio. O gráfico será criado automaticamente.
          </p>
        </div>
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Consumo atual</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{latest.consumption} km/l</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {variationLabel(comparison?.consumptionChange ?? null, true)} vs. ciclo anterior
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Litros / 100 km</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {latest.litersPer100Km != null ? `${latest.litersPer100Km} L` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {variationLabel(comparison?.litersPer100KmChange ?? null, false)} vs. ciclo anterior
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Custo / 100 km</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {latest.costPer100Km != null ? formatCurrency(latest.costPer100Km) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {variationLabel(comparison?.costPer100KmChange ?? null, false)} vs. ciclo anterior
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Preço médio do ciclo</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(latest.averagePrice)}/L</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {comparison
              ? `${comparison.costPerKmChange != null && comparison.costPerKmChange <= 0 ? "Custo/km melhor" : "Custo/km maior"} no último ciclo`
              : "Primeiro ciclo completo"}
          </p>
        </div>
      </div>

      {comparison ? (
        <div className="rounded-xl border border-border bg-card p-3 text-sm">
          <p className="font-semibold">Comparação com o ciclo anterior</p>
          <div className="mt-2 grid gap-2 text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span>
              Consumo: <strong className="text-foreground">{comparison.previous.consumption} → {comparison.current.consumption} km/l</strong>
            </span>
            <span>
              R$/km: <strong className="text-foreground">{formatCurrency(comparison.previous.costPerKm)} → {formatCurrency(comparison.current.costPerKm)}</strong>
            </span>
            <span>
              L/100 km: <strong className="text-foreground">{comparison.previous.litersPer100Km ?? "—"} → {comparison.current.litersPer100Km ?? "—"}</strong>
            </span>
            <span>
              R$/100 km: <strong className="text-foreground">{comparison.previous.costPer100Km != null ? formatCurrency(comparison.previous.costPer100Km) : "—"} → {comparison.current.costPer100Km != null ? formatCurrency(comparison.current.costPer100Km) : "—"}</strong>
            </span>
          </div>
        </div>
      ) : null}

      <div className="h-72 w-full" role="img" aria-label="Evolução do consumo de combustível e custo por quilômetro por ciclo completo">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="consumption"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={42}
              unit=" km/l"
            />
            <YAxis
              yAxisId="cost"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-xl">
                    <p className="font-semibold">Ciclo fechado em {item.label}</p>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <p>Consumo: <strong className="text-foreground">{item.consumption} km/l</strong></p>
                      <p>Litros/100 km: <strong className="text-foreground">{item.litersPer100Km ?? "—"}</strong></p>
                      <p>Custo/km: <strong className="text-foreground">{formatCurrency(item.costPerKm)}</strong></p>
                      <p>Custo/100 km: <strong className="text-foreground">{item.costPer100Km != null ? formatCurrency(item.costPer100Km) : "—"}</strong></p>
                      <p>Preço médio/L: <strong className="text-foreground">{formatCurrency(item.averagePrice)}</strong></p>
                      <p>Distância: <strong className="text-foreground">{item.distance} km</strong></p>
                      <p>Combustível: <strong className="text-foreground">{item.liters} L</strong></p>
                      <p>Gasto do ciclo: <strong className="text-foreground">{formatCurrency(item.cost)}</strong></p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="consumption"
              type="monotone"
              dataKey="consumption"
              name="Consumo (km/l)"
              stroke="var(--success)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="cost"
              type="monotone"
              dataKey="costPerKm"
              name="Custo por km (R$)"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
