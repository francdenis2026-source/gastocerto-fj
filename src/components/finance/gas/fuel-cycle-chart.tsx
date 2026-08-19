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
import { buildFuelCycles, type FuelEntry } from "@/lib/vehicles";

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
          distance: cycle.distance,
          liters: cycle.liters,
          cost: cycle.cost,
        })),
    [entries],
  );

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

  return (
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
                    <p>Custo/km: <strong className="text-foreground">{formatCurrency(item.costPerKm)}</strong></p>
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
  );
}
