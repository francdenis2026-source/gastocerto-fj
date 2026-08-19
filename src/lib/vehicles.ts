import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Vehicle = Tables<"vehicles">;
export type FuelEntry = Tables<"fuel_entries">;

export const VEHICLE_TYPES = [
  { value: "car", label: "Carro" },
  { value: "motorcycle", label: "Moto" },
  { value: "truck", label: "Caminhão" },
  { value: "van", label: "Van / Utilitário" },
  { value: "other", label: "Outro" },
] as const;

export const FUEL_TYPES = [
  { value: "gasolina", label: "Gasolina comum" },
  { value: "gasolina_aditivada", label: "Gasolina aditivada" },
  { value: "etanol", label: "Etanol / Álcool" },
  { value: "flex", label: "Flex (gasolina + etanol)" },
  { value: "diesel", label: "Diesel" },
  { value: "diesel_s10", label: "Diesel S-10" },
  { value: "gnv", label: "GNV" },
  { value: "eletrico", label: "Elétrico (kWh)" },
] as const;

export function useVehicles(includeInactive = false) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vehicles", user?.id, includeInactive],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Vehicle[]> => {
      let query = supabase.from("vehicles").select("*").order("created_at", { ascending: true });
      if (!includeInactive) query = query.eq("active", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFuelEntries(vehicleId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fuel-entries", user?.id, vehicleId ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<FuelEntry[]> => {
      let query = supabase
        .from("fuel_entries")
        .select("*")
        .order("entry_date", { ascending: false })
        .order("odometer", { ascending: false });
      if (vehicleId) query = query.eq("vehicle_id", vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useRefreshFleet() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      queryClient.invalidateQueries({ queryKey: ["fuel-entries"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    ]);
  };
}

export function useSaveVehicle() {
  const { user } = useAuth();
  const refresh = useRefreshFleet();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      values: Omit<TablesInsert<"vehicles">, "user_id">;
      limit?: number | null;
    }) => {
      if (!user) throw new Error("Sessão expirada");
      if (input.id) {
        const { error } = await supabase
          .from("vehicles")
          .update(input.values as TablesUpdate<"vehicles">)
          .eq("id", input.id);
        if (error) throw error;
        return;
      }
      const { count } = await supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      const { data: access } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (access !== true && input.limit != null && (count ?? 0) >= input.limit) {
        throw new Error(
          `Seu plano permite ${input.limit} veículo(s). Faça upgrade para o Premium IA para cadastrar veículos ilimitados.`,
        );
      }
      const { error } = await supabase.from("vehicles").insert({ ...input.values, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useDeleteVehicle() {
  const refresh = useRefreshFleet();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export type FuelCycle = {
  vehicleId: string;
  startEntryId: string;
  endEntryId: string;
  startDate: string;
  endDate: string;
  startOdometer: number;
  endOdometer: number;
  distance: number;
  liters: number;
  cost: number;
  consumption: number;
  costPerKm: number;
  averagePrice: number;
  fillCount: number;
};

/** Constrói ciclos precisos pelo método tanque cheio -> tanque cheio. */
export function buildFuelCycles(entries: FuelEntry[]): FuelCycle[] {
  const cycles: FuelCycle[] = [];
  const byVehicle = new Map<string, FuelEntry[]>();

  for (const entry of entries) {
    const list = byVehicle.get(entry.vehicle_id) ?? [];
    list.push(entry);
    byVehicle.set(entry.vehicle_id, list);
  }

  for (const [vehicleId, own] of byVehicle) {
    const history = own
      .slice()
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date) || Number(a.odometer) - Number(b.odometer));

    let baseline: FuelEntry | null = null;
    let cycleLiters = 0;
    let cycleCost = 0;
    let fillCount = 0;

    for (const entry of history) {
      if (!baseline) {
        if (entry.full_tank === true) {
          baseline = entry;
          cycleLiters = 0;
          cycleCost = 0;
          fillCount = 0;
        }
        continue;
      }

      const liters = Number(entry.liters ?? 0);
      const cost = Number(entry.total_amount ?? 0);
      if (Number.isFinite(liters) && liters > 0) cycleLiters += liters;
      if (Number.isFinite(cost) && cost > 0) cycleCost += cost;
      fillCount += 1;

      if (entry.full_tank !== true) continue;

      const distance = Number(entry.odometer) - Number(baseline.odometer);
      if (distance > 0 && cycleLiters > 0) {
        cycles.push({
          vehicleId,
          startEntryId: baseline.id,
          endEntryId: entry.id,
          startDate: baseline.entry_date,
          endDate: entry.entry_date,
          startOdometer: Number(baseline.odometer),
          endOdometer: Number(entry.odometer),
          distance: round(distance, 1),
          liters: round(cycleLiters, 3),
          cost: round(cycleCost, 2),
          consumption: round(distance / cycleLiters, 2),
          costPerKm: round(cycleCost / distance, 3),
          averagePrice: round(cycleCost / cycleLiters, 3),
          fillCount,
        });
      }

      baseline = entry;
      cycleLiters = 0;
      cycleCost = 0;
      fillCount = 0;
    }
  }

  return cycles;
}

async function recalculateVehicleFuelMetrics(vehicleId: string) {
  const { data, error } = await supabase
    .from("fuel_entries")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("entry_date", { ascending: true })
    .order("odometer", { ascending: true });
  if (error) throw error;

  const history = (data ?? []) as FuelEntry[];
  const cycles = buildFuelCycles(history);
  const byEndEntry = new Map(cycles.map((cycle) => [cycle.endEntryId, cycle]));

  await Promise.all(
    history.map(async (entry) => {
      const cycle = byEndEntry.get(entry.id);
      const values: TablesUpdate<"fuel_entries"> = {
        distance: cycle?.distance ?? null,
        consumption: cycle?.consumption ?? null,
        cost_per_km: cycle?.costPerKm ?? null,
      };
      const { error: updateError } = await supabase.from("fuel_entries").update(values).eq("id", entry.id);
      if (updateError) throw updateError;
    }),
  );
}

export function useSaveFuelEntry() {
  const { user } = useAuth();
  const refresh = useRefreshFleet();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      values: Omit<TablesInsert<"fuel_entries">, "user_id">;
      createTransaction?: { categoryId: string | null; accountId: string | null };
    }) => {
      if (!user) throw new Error("Sessão expirada");

      const newVehicleId = String(input.values.vehicle_id);
      let previousVehicleId: string | null = null;

      if (input.id) {
        const { data: previous, error: previousError } = await supabase
          .from("fuel_entries")
          .select("vehicle_id")
          .eq("id", input.id)
          .single();
        if (previousError) throw previousError;
        previousVehicleId = previous?.vehicle_id ?? null;

        const { error } = await supabase
          .from("fuel_entries")
          .update(input.values as TablesUpdate<"fuel_entries">)
          .eq("id", input.id);
        if (error) throw error;

        if (previousVehicleId && previousVehicleId !== newVehicleId) {
          await recalculateVehicleFuelMetrics(previousVehicleId);
        }
        await recalculateVehicleFuelMetrics(newVehicleId);
        return;
      }

      let transactionId: string | null = null;
      if (input.createTransaction) {
        const { data, error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            description: `Abastecimento${input.values.station ? ` — ${input.values.station}` : ""}`,
            amount: input.values.total_amount,
            transaction_type: "expense",
            transaction_date: input.values.entry_date ?? new Date().toISOString().slice(0, 10),
            category_id: input.createTransaction.categoryId,
            account_id: input.createTransaction.accountId,
            vehicle_id: input.values.vehicle_id,
            attachment_url: input.values.attachment_url ?? null,
            payment_method: "credito",
            expense_type: "variavel",
            status: "paid",
          })
          .select("id")
          .single();
        if (error) throw error;
        transactionId = data.id;
      }

      const { error } = await supabase
        .from("fuel_entries")
        .insert({ ...input.values, user_id: user.id, transaction_id: transactionId });
      if (error) throw error;

      await recalculateVehicleFuelMetrics(newVehicleId);
    },
    onSuccess: refresh,
  });
}

export function useDeleteFuelEntry() {
  const refresh = useRefreshFleet();
  return useMutation({
    mutationFn: async (entry: FuelEntry) => {
      const { error } = await supabase.from("fuel_entries").delete().eq("id", entry.id);
      if (error) throw error;
      if (entry.transaction_id) {
        await supabase
          .from("transactions")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", entry.transaction_id);
      }
      await recalculateVehicleFuelMetrics(entry.vehicle_id);
    },
    onSuccess: refresh,
  });
}

export type OdometerCheck = { ok: true } | { ok: false; message: string };

export function validateOdometer(
  odometer: number,
  entryDate: string,
  vehicle: Vehicle | undefined,
  entries: FuelEntry[],
  ignoreId?: string,
): OdometerCheck {
  if (!Number.isFinite(odometer) || odometer <= 0) {
    return { ok: false, message: "Informe a quilometragem do painel." };
  }
  if (vehicle && odometer < Number(vehicle.initial_odometer ?? 0)) {
    return { ok: false, message: `A quilometragem não pode ser menor que a inicial (${vehicle.initial_odometer} km).` };
  }

  const history = entries
    .filter((entry) => entry.id !== ignoreId)
    .slice()
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date) || Number(a.odometer) - Number(b.odometer));

  const previous = [...history].reverse().find((entry) => entry.entry_date <= entryDate);
  const next = history.find((entry) => entry.entry_date > entryDate);

  if (previous && odometer <= Number(previous.odometer)) {
    return { ok: false, message: `A quilometragem deve ser maior que ${previous.odometer} km (último abastecimento).` };
  }
  if (next && odometer >= Number(next.odometer)) {
    return { ok: false, message: `A quilometragem deve ser menor que ${next.odometer} km (abastecimento seguinte).` };
  }
  if (previous && odometer - Number(previous.odometer) > 20_000) {
    return { ok: false, message: "Diferença de quilometragem muito alta. Confira o valor." };
  }
  return { ok: true };
}

export type FuelMetricPreview = {
  distance: number | null;
  consumption: number | null;
  costPerKm: number | null;
  cycleLiters: number | null;
  cycleCost: number | null;
  baselineOdometer: number | null;
  measurementComplete: boolean;
};

export function computeFuelMetrics(
  odometer: number,
  liters: number,
  totalAmount: number,
  entryDate: string,
  entries: FuelEntry[],
  ignoreId?: string,
  currentFullTank = true,
): FuelMetricPreview {
  const history = entries
    .filter((entry) => entry.id !== ignoreId)
    .filter(
      (entry) =>
        entry.entry_date < entryDate ||
        (entry.entry_date === entryDate && Number(entry.odometer) < odometer),
    )
    .slice()
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date) || Number(a.odometer) - Number(b.odometer));

  const baseline = [...history].reverse().find((entry) => entry.full_tank === true);
  if (!baseline) {
    return {
      distance: null,
      consumption: null,
      costPerKm: null,
      cycleLiters: null,
      cycleCost: null,
      baselineOdometer: null,
      measurementComplete: false,
    };
  }

  const sinceBaseline = history.filter(
    (entry) =>
      entry.entry_date > baseline.entry_date ||
      (entry.entry_date === baseline.entry_date && Number(entry.odometer) > Number(baseline.odometer)),
  );
  const cycleLiters = sinceBaseline.reduce((sum, entry) => sum + Number(entry.liters ?? 0), 0) + liters;
  const cycleCost = sinceBaseline.reduce((sum, entry) => sum + Number(entry.total_amount ?? 0), 0) + totalAmount;
  const distance = round(odometer - Number(baseline.odometer), 1);

  if (distance <= 0 || cycleLiters <= 0) {
    return {
      distance: null,
      consumption: null,
      costPerKm: null,
      cycleLiters: round(cycleLiters, 3),
      cycleCost: round(cycleCost, 2),
      baselineOdometer: Number(baseline.odometer),
      measurementComplete: false,
    };
  }

  if (!currentFullTank) {
    return {
      distance,
      consumption: null,
      costPerKm: null,
      cycleLiters: round(cycleLiters, 3),
      cycleCost: round(cycleCost, 2),
      baselineOdometer: Number(baseline.odometer),
      measurementComplete: false,
    };
  }

  return {
    distance,
    consumption: round(distance / cycleLiters, 2),
    costPerKm: round(cycleCost / distance, 3),
    cycleLiters: round(cycleLiters, 3),
    cycleCost: round(cycleCost, 2),
    baselineOdometer: Number(baseline.odometer),
    measurementComplete: true,
  };
}

export function odometerWarnings(
  odometer: number,
  liters: number,
  entryDate: string,
  vehicle: Vehicle | undefined,
  entries: FuelEntry[],
  ignoreId?: string,
  currentFullTank = true,
): string[] {
  const warnings: string[] = [];
  if (!Number.isFinite(odometer)) return warnings;

  const previous = entries
    .filter((entry) => entry.id !== ignoreId && entry.entry_date <= entryDate)
    .slice()
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer))
    .find((entry) => Number(entry.odometer) < odometer);

  if (previous) {
    const distance = odometer - Number(previous.odometer);
    if (distance < 5) warnings.push(`Apenas ${round(distance, 1)} km desde o último abastecimento. Confira o odômetro.`);
    if (distance > 3000) warnings.push(`Variação alta: ${round(distance, 1)} km desde o último abastecimento.`);
  }

  if (currentFullTank) {
    const preview = computeFuelMetrics(odometer, liters, 0, entryDate, entries, ignoreId, true);
    if (preview.consumption != null) {
      if (preview.consumption > 40) warnings.push(`Consumo calculado muito alto (${round(preview.consumption, 1)} km/l).`);
      if (preview.consumption < 3) warnings.push(`Consumo calculado muito baixo (${round(preview.consumption, 1)} km/l).`);
      const reference = Number(vehicle?.average_consumption ?? 0);
      if (reference > 0 && Math.abs(preview.consumption - reference) / reference > 0.4) {
        warnings.push(`Consumo ${round(preview.consumption, 1)} km/l está longe da média cadastrada (${reference} km/l).`);
      }
    }
  }

  const tank = Number(vehicle?.tank_capacity ?? 0);
  if (tank > 0 && Number.isFinite(liters) && liters > tank * 1.1) {
    warnings.push(`Litros acima da capacidade do tanque (${tank} L).`);
  }

  return warnings;
}

export type FuelSummary = {
  total: number;
  liters: number;
  entries: number;
  distance: number;
  averagePrice: number | null;
  averageConsumption: number | null;
  costPerKm: number | null;
  best: FuelEntry | null;
  worst: FuelEntry | null;
  cycles: number;
  measuredLiters: number;
  measuredCost: number;
};

/**
 * Totais financeiros usam as entradas visíveis. Consumo e custo/km são sempre
 * reconstruídos do histórico real de ciclos, sem depender dos campos derivados
 * gravados anteriormente no banco. Quando um filtro está ativo, um ciclo entra
 * no resumo se o abastecimento que fechou esse ciclo estiver visível.
 */
export function summarizeFuel(entries: FuelEntry[], historyEntries: FuelEntry[] = entries): FuelSummary {
  const total = entries.reduce((sum, entry) => sum + Number(entry.total_amount ?? 0), 0);
  const liters = entries.reduce((sum, entry) => sum + Number(entry.liters ?? 0), 0);
  const visibleIds = new Set(entries.map((entry) => entry.id));
  const cycles = buildFuelCycles(historyEntries).filter((cycle) => visibleIds.has(cycle.endEntryId));

  const distance = cycles.reduce((sum, cycle) => sum + cycle.distance, 0);
  const measuredLiters = cycles.reduce((sum, cycle) => sum + cycle.liters, 0);
  const measuredCost = cycles.reduce((sum, cycle) => sum + cycle.cost, 0);
  const entryById = new Map(historyEntries.map((entry) => [entry.id, entry]));
  const ranked = cycles.slice().sort((a, b) => b.consumption - a.consumption);

  return {
    total: round(total),
    liters: round(liters),
    entries: entries.length,
    distance: round(distance, 1),
    averagePrice: liters > 0 ? round(total / liters, 3) : null,
    averageConsumption: measuredLiters > 0 ? round(distance / measuredLiters, 2) : null,
    costPerKm: distance > 0 ? round(measuredCost / distance, 3) : null,
    best: ranked[0] ? entryById.get(ranked[0].endEntryId) ?? null : null,
    worst: ranked.length > 1 ? entryById.get(ranked[ranked.length - 1].endEntryId) ?? null : null,
    cycles: cycles.length,
    measuredLiters: round(measuredLiters, 3),
    measuredCost: round(measuredCost, 2),
  };
}

export type VehicleFuelStats = {
  vehicle: Vehicle;
  summary: FuelSummary;
  target: number | null;
  threshold: number;
  alert: boolean;
  budgetAlert: boolean;
  deviation: number | null;
};

export function statsByVehicle(
  vehicles: Vehicle[],
  entries: FuelEntry[],
  historyEntries: FuelEntry[] = entries,
): VehicleFuelStats[] {
  return vehicles.map((vehicle) => {
    const own = entries.filter((entry) => entry.vehicle_id === vehicle.id);
    const ownHistory = historyEntries.filter((entry) => entry.vehicle_id === vehicle.id);
    const summary = summarizeFuel(own, ownHistory);
    const target = Number(vehicle.target_consumption ?? 0) || Number(vehicle.average_consumption ?? 0) || null;
    const threshold = Math.max(1, Number(vehicle.alert_threshold ?? 10));
    const enabled = vehicle.alerts_enabled !== false;
    const deviation = target && summary.averageConsumption
      ? round(((summary.averageConsumption - target) / target) * 100, 1)
      : null;
    const budget = Number(vehicle.monthly_fuel_budget ?? 0);
    return {
      vehicle,
      summary,
      target,
      threshold,
      deviation,
      alert: enabled && deviation != null && deviation <= -threshold,
      budgetAlert: enabled && budget > 0 && summary.total > budget,
    };
  });
}

export function fuelStatsCsv(
  stats: VehicleFuelStats[],
  period: { from?: string; to?: string } = {},
): string {
  const header = [
    "Veiculo",
    "Placa",
    "Periodo inicial",
    "Periodo final",
    "Abastecimentos",
    "Litros",
    "Distancia (km)",
    "Consumo medio (km/l)",
    "Meta (km/l)",
    "Variacao (%)",
    "Preco medio (R$/L)",
    "Custo por km (R$)",
    "Total no periodo (R$)",
    "Alerta",
  ];

  const rows = stats.map((item) =>
    [
      item.vehicle.name,
      item.vehicle.plate ?? "",
      period.from ?? "",
      period.to ?? "",
      item.summary.entries,
      item.summary.liters,
      item.summary.distance,
      item.summary.averageConsumption ?? "",
      item.target ?? "",
      item.deviation ?? "",
      item.summary.averagePrice ?? "",
      item.summary.costPerKm ?? "",
      item.summary.total,
      item.alert ? "Consumo abaixo da meta" : item.budgetAlert ? "Gasto acima do teto" : "",
    ]
      .map((value) => String(value).replace(/;/g, ","))
      .join(";"),
  );

  const totals = stats.reduce(
    (acc, item) => ({
      entries: acc.entries + item.summary.entries,
      liters: round(acc.liters + item.summary.liters, 2),
      distance: round(acc.distance + item.summary.distance, 1),
      total: round(acc.total + item.summary.total, 2),
      measuredLiters: round(acc.measuredLiters + item.summary.measuredLiters, 3),
      measuredCost: round(acc.measuredCost + item.summary.measuredCost, 2),
    }),
    { entries: 0, liters: 0, distance: 0, total: 0, measuredLiters: 0, measuredCost: 0 },
  );

  const totalRow = [
    "TOTAL",
    "",
    period.from ?? "",
    period.to ?? "",
    totals.entries,
    totals.liters,
    totals.distance,
    totals.distance > 0 && totals.measuredLiters > 0 ? round(totals.distance / totals.measuredLiters, 2) : "",
    "",
    "",
    totals.liters > 0 ? round(totals.total / totals.liters, 3) : "",
    totals.distance > 0 ? round(totals.measuredCost / totals.distance, 3) : "",
    totals.total,
    "",
  ].join(";");

  return [header.join(";"), ...rows, totalRow].join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type VehicleAlertSettings = {
  target_consumption: number | null;
  alert_threshold: number;
  monthly_fuel_budget: number | null;
  alerts_enabled: boolean;
};

export function useSaveVehicleSettings() {
  const refresh = useRefreshFleet();
  return useMutation({
    mutationFn: async (input: { id: string; values: VehicleAlertSettings }) => {
      const { error } = await supabase.from("vehicles").update(input.values).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}
