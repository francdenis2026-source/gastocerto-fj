import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format-utils";
import { round, statsByVehicle, type FuelEntry, type Vehicle } from "@/lib/vehicles";

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

export function FleetFuelAnalytics({ vehicles, entries }: { vehicles: Vehicle[]; entries: FuelEntry[] }) {
  const stats = useMemo(
    () => statsByVehicle(vehicles, entries, entries).filter((item) => item.summary.entries > 0),
    [vehicles, entries],
  );

  const data = useMemo(
    () => stats.map((item) => ({
      name: item.vehicle.name,
      consumption: item.summary.averageConsumption ?? 0,
      distance: item.summary.distance,
      costPerKm: item.summary.costPerKm ?? 0,
      total: item.summary.total,
      liters: item.summary.liters,
      cycles: item.summary.cycles,
    })),
    [stats],
  );

  const totals = useMemo(() => {
    const distance = data.reduce((sum, item) => sum + item.distance, 0);
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const liters = data.reduce((sum, item) => sum + item.liters, 0);
    const cycles = data.reduce((sum, item) => sum + item.cycles, 0);
    return {
      distance: round(distance, 1),
      total: round(total, 2),
      liters: round(liters, 2),
      cycles,
      averageConsumption: liters > 0 ? round(distance / liters, 2) : null,
      costPerKm: distance > 0 ? round(total / distance, 3) : null,
      averageDistance: cycles > 0 ? round(distance / cycles, 1) : null,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm font-semibold">Ainda não há ciclos completos para comparar a frota.</p>
        <p className="mt-1 text-xs text-muted-foreground">A comparação aparece quando pelo menos um veículo fecha um ciclo tanque cheio → tanque cheio.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <Kpi label="Consumo médio da frota" value={totals.averageConsumption != null ? `${totals.averageConsumption} km/l` : "—"} hint={`${totals.cycles} ciclos completos`} />
        <Kpi label="Distância média / ciclo" value={totals.averageDistance != null ? `${totals.averageDistance} km` : "—"} hint={`Total: ${totals.distance} km`} />
        <Kpi label="Gasto total" value={formatCurrency(totals.total)} hint={`${data.length} veículo${data.length === 1 ? "" : "s"} com dados`} />
        <Kpi label="Litros totais" value={`${totals.liters} L`} hint="Somatório dos abastecimentos" />
        <Kpi label="Custo médio / km" value={totals.costPerKm != null ? formatCurrency(totals.costPerKm) : "—"} hint="Ponderado pela distância" />
        <Kpi label="Custo médio / 100 km" value={totals.costPerKm != null ? formatCurrency(round(totals.costPerKm * 100, 2)) : "—"} hint="Comparação padronizada" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Consumo médio por veículo</h3>
            <p className="mt-1 text-xs text-muted-foreground">Compara somente ciclos completos para evitar distorções.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-12} textAnchor="end" height={54} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={46} />
                <Tooltip formatter={(value: number) => [`${value} km/l`, "Consumo médio"]} />
                <Bar dataKey="consumption" name="Consumo médio (km/l)" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Distância e custo por veículo</h3>
            <p className="mt-1 text-xs text-muted-foreground">Ajuda a identificar quais veículos rodam mais e quais custam mais por quilômetro.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-12} textAnchor="end" height={54} />
                <YAxis yAxisId="distance" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={52} />
                <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={52} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as (typeof data)[number];
                  return (
                    <div className="rounded-xl border border-border bg-popover p-3 text-xs shadow-xl">
                      <p className="font-semibold">{item.name}</p>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>Distância: <strong className="text-foreground">{item.distance} km</strong></p>
                        <p>Custo/km: <strong className="text-foreground">{formatCurrency(item.costPerKm)}</strong></p>
                        <p>Gasto: <strong className="text-foreground">{formatCurrency(item.total)}</strong></p>
                        <p>Litros: <strong className="text-foreground">{item.liters} L</strong></p>
                      </div>
                    </div>
                  );
                }} />
                <Bar yAxisId="distance" dataKey="distance" name="Distância (km)" fill="var(--success)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="cost" dataKey="costPerKm" name="Custo/km" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
