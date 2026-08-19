import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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
  };
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function FuelCycleChart({ entries }: { entries: FuelEntry[] }) {
  const cycles = useMemo(() => buildFuelCycles(entries), [entries]);
  const live = useMemo(() => currentCycle(entries), [entries]);

  const data = useMemo(
    () =>
      cycles
        .slice()
        .sort((a, b) => a.endDate.localeCompare(b.endDate))
        .map((cycle, index) => ({
          index: index + 1,
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

  const analytics = useMemo(() => {
    if (data.length === 0) return null;
    const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
    const totalLiters = data.reduce((sum, item) => sum + item.liters, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const averageConsumption = totalLiters > 0 ? round(totalDistance / totalLiters, 2) : null;
    const averageDistance = round(totalDistance / data.length, 1);
    const averageCycleCost = round(totalCost / data.length, 2);
    const averageLiters = round(totalLiters / data.length, 2);
    const costPerKm = totalDistance > 0 ? round(totalCost / totalDistance, 3) : null;
    const costPer100Km = costPerKm != null ? round(costPerKm * 100, 2) : null;
    return {
      totalDistance,
      totalLiters,
      totalCost,
      averageConsumption,
      averageDistance,
      averageCycleCost,
      averageLiters,
      costPerKm,
      costPer100Km,
    };
  }, [data]);

  const comparison = useMemo(() => {
    if (data.length < 2) return null;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return {
      current,
      previous,
      consumptionChange: percentChange(current.consumption, previous.consumption),
      costPerKmChange: percentChange(current.costPerKm, previous.costPerKm),
      distanceChange: percentChange(current.distance, previous.distance),
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
              <MetricCard label="Odômetro atual" value={`${live.end.odometer} km`} hint="Última leitura registrada" />
              <MetricCard label="Distância atual" value={`${live.distance} km`} hint="Desde o último tanque cheio" />
              <MetricCard label="Litros acumulados" value={`${live.liters} L`} hint="Após a referência" />
              <MetricCard label="Gasto acumulado" value={formatCurrency(live.cost)} hint="Após a referência" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              O sistema já acompanha distância, litros e gasto. O consumo médio em km/l só é publicado quando um abastecimento posterior também termina com o tanque cheio.
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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <MetricCard
          label="Consumo médio"
          value={analytics?.averageConsumption != null ? `${analytics.averageConsumption} km/l` : "—"}
          hint={`${data.length} ciclo${data.length === 1 ? "" : "s"} completo${data.length === 1 ? "" : "s"}`}
        />
        <MetricCard
          label="Distância média"
          value={analytics ? `${analytics.averageDistance} km` : "—"}
          hint={`Total medido: ${round(analytics?.totalDistance ?? 0, 1)} km`}
        />
        <MetricCard
          label="Gasto médio / ciclo"
          value={analytics ? formatCurrency(analytics.averageCycleCost) : "—"}
          hint={`Total: ${formatCurrency(analytics?.totalCost ?? 0)}`}
        />
        <MetricCard
          label="Litros médios / ciclo"
          value={analytics ? `${analytics.averageLiters} L` : "—"}
          hint={`Total: ${round(analytics?.totalLiters ?? 0, 2)} L`}
        />
        <MetricCard
          label="Custo médio / km"
          value={analytics?.costPerKm != null ? formatCurrency(analytics.costPerKm) : "—"}
          hint="Custo ponderado pela distância"
        />
        <MetricCard
          label="Custo médio / 100 km"
          value={analytics?.costPer100Km != null ? formatCurrency(analytics.costPer100Km) : "—"}
          hint="Comparação financeira padronizada"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Eficiência de combustível"
          description="Evolução do consumo em km/l e do custo por quilômetro em cada ciclo completo."
        >
          <div className="h-80 w-full" role="img" aria-label="Gráfico de consumo e custo por quilômetro">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.55} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="consumption" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={44} />
                <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={52} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as (typeof data)[number];
                  return (
                    <div className="rounded-xl border border-border bg-popover p-3 text-xs shadow-xl">
                      <p className="font-semibold">Ciclo {formatDate(item.startDate)} → {item.label}</p>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>Consumo: <strong className="text-foreground">{item.consumption} km/l</strong></p>
                        <p>Distância: <strong className="text-foreground">{item.distance} km</strong></p>
                        <p>Custo/km: <strong className="text-foreground">{formatCurrency(item.costPerKm)}</strong></p>
                        <p>R$/100 km: <strong className="text-foreground">{item.costPer100Km != null ? formatCurrency(item.costPer100Km) : "—"}</strong></p>
                      </div>
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="consumption" type="monotone" dataKey="consumption" name="Consumo (km/l)" fill="var(--primary)" fillOpacity={0.10} stroke="var(--primary)" strokeWidth={2.5} />
                <Line yAxisId="cost" type="monotone" dataKey="costPerKm" name="Custo/km (R$)" stroke="var(--destructive)" strokeWidth={2.2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Distância por ciclo"
          description="Quantos quilômetros foram percorridos entre cada medição completa de tanque."
        >
          <div className="h-80 w-full" role="img" aria-label="Gráfico de distância percorrida por ciclo">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.55} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(value: number) => [`${value} km`, "Distância"]} />
                <Bar dataKey="distance" name="Distância (km)" fill="var(--primary)" radius={[8, 8, 2, 2]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Custo e volume abastecido"
        description="Compare quanto foi gasto e quantos litros entraram em cada ciclo para identificar aumento de preço ou uso."
      >
        <div className="h-80 w-full" role="img" aria-label="Gráfico de gasto e litros por ciclo">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.55} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="money" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={52} />
              <YAxis yAxisId="liters" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-border bg-popover p-3 text-xs shadow-xl">
                    <p className="font-semibold">Ciclo encerrado em {item.label}</p>
                    <p className="mt-2 text-muted-foreground">Gasto: <strong className="text-foreground">{formatCurrency(item.cost)}</strong></p>
                    <p className="text-muted-foreground">Litros: <strong className="text-foreground">{item.liters} L</strong></p>
                    <p className="text-muted-foreground">Preço médio: <strong className="text-foreground">{formatCurrency(item.averagePrice)}/L</strong></p>
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="money" type="monotone" dataKey="cost" name="Gasto (R$)" fill="var(--primary)" fillOpacity={0.14} stroke="var(--primary)" strokeWidth={2.4} />
              <Area yAxisId="liters" type="monotone" dataKey="liters" name="Litros" fill="var(--success)" fillOpacity={0.08} stroke="var(--success)" strokeWidth={2.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Leitura do último ciclo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(latest.startDate)} → {latest.label} · {latest.distance} km · {latest.liters} L · {formatCurrency(latest.cost)}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{variationLabel(comparison?.consumptionChange ?? null, true)} no consumo</p>
            <p>{variationLabel(comparison?.costPerKmChange ?? null, false)} no custo/km</p>
            {comparison?.distanceChange != null ? <p>{Math.abs(comparison.distanceChange)}% de variação na distância</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
