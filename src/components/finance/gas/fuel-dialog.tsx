import { useMemo, useState } from "react";
import { Calculator, Loader2, Route, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { ReceiptField } from "@/components/finance/receipt-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isoDate, parseAmount, toCents } from "@/lib/finance";
import { diffValues, useLogFuelAudit } from "@/lib/fuel-audit";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useCategories } from "@/lib/queries";
import { useAccounts } from "@/lib/transactions";
import { maskAmountInput, maskDecimalInput } from "@/lib/money-input";
import { sanitizeText } from "@/lib/validation";
import {
  FUEL_TYPES,
  computeFuelMetrics,
  odometerWarnings,
  round,
  useFuelEntries,
  useSaveFuelEntry,
  validateOdometer,
  type FuelEntry,
  type Vehicle,
} from "@/lib/vehicles";

type FillMode = "full" | "top_off" | "partial";
type CalculationSource = "total" | "liters";

const FILL_MODES: Array<{ value: FillMode; label: string; description: string }> = [
  {
    value: "full",
    label: "Enchi o tanque",
    description: "O abastecimento terminou com o tanque cheio e pode fechar uma medição de consumo.",
  },
  {
    value: "top_off",
    label: "Apenas completei até encher",
    description: "Havia combustível no tanque e você só completou até ficar cheio. Também pode fechar a medição.",
  },
  {
    value: "partial",
    label: "Abastecimento parcial",
    description: "O tanque não ficou cheio. Litros e gasto serão acumulados, mas a média não será fechada agora.",
  },
];

function decimalInput(value: number, digits = 3) {
  return value.toFixed(digits).replace(".", ",");
}

export function FuelDialog({
  open,
  onOpenChange,
  vehicles,
  defaultVehicleId,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  entry?: FuelEntry | null;
}) {
  const save = useSaveFuelEntry();
  const logAudit = useLogFuelAudit();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const storedFillMode = (entry as (FuelEntry & { fill_mode?: FillMode }) | null | undefined)?.fill_mode;
  const initialFillMode: FillMode = storedFillMode ?? (entry?.full_tank === false ? "partial" : "full");

  const [vehicleId, setVehicleId] = useState(
    entry?.vehicle_id ?? defaultVehicleId ?? vehicles[0]?.id ?? "",
  );
  const { data: entries } = useFuelEntries(vehicleId || undefined);

  const [date, setDate] = useState(entry?.entry_date ?? isoDate(new Date()));
  const [odometer, setOdometer] = useState(entry ? String(entry.odometer) : "");
  const [liters, setLiters] = useState(entry ? String(entry.liters).replace(".", ",") : "");
  const [pricePerLiter, setPricePerLiter] = useState(
    entry ? String(entry.price_per_liter).replace(".", ",") : "",
  );
  const [total, setTotal] = useState(entry ? maskAmountInput(String(Math.round(Number(entry.total_amount) * 100))) : "");
  const [calculationSource, setCalculationSource] = useState<CalculationSource>(entry ? "liters" : "total");
  const [fuelType, setFuelType] = useState(entry?.fuel_type ?? "gasolina");
  const [station, setStation] = useState(entry?.station ?? "");
  const [fillMode, setFillMode] = useState<FillMode>(initialFillMode);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [attachment, setAttachment] = useState<string | null>(entry?.attachment_url ?? null);
  const [createExpense, setCreateExpense] = useState(!entry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [accountId, setAccountId] = useState("");

  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const fullTank = fillMode !== "partial";

  const enteredLiters = parseAmount(liters);
  const priceValue = parseAmount(pricePerLiter);
  const enteredTotal = parseAmount(total);

  const calculatedLiters =
    calculationSource === "total" &&
    Number.isFinite(enteredTotal) &&
    enteredTotal > 0 &&
    Number.isFinite(priceValue) &&
    priceValue > 0
      ? round(enteredTotal / priceValue, 3)
      : Number.NaN;

  const calculatedTotal =
    calculationSource === "liters" &&
    Number.isFinite(enteredLiters) &&
    enteredLiters > 0 &&
    Number.isFinite(priceValue) &&
    priceValue > 0
      ? toCents(enteredLiters * priceValue)
      : Number.NaN;

  const litersValue = calculationSource === "total" ? calculatedLiters : enteredLiters;
  const totalValue = calculationSource === "liters" ? calculatedTotal : enteredTotal;

  const displayedLiters =
    calculationSource === "total" && Number.isFinite(calculatedLiters)
      ? decimalInput(calculatedLiters)
      : liters;
  const displayedTotal =
    calculationSource === "liters" && Number.isFinite(calculatedTotal)
      ? decimalInput(calculatedTotal, 2)
      : total;

  const odometerValue = parseAmount(odometer);

  const previousEntry = useMemo(() => {
    if (!Number.isFinite(odometerValue)) return null;
    return (entries ?? [])
      .filter((item) => item.id !== entry?.id)
      .filter(
        (item) =>
          item.entry_date < date ||
          (item.entry_date === date && Number(item.odometer) < odometerValue),
      )
      .slice()
      .sort(
        (a, b) =>
          b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer),
      )[0] ?? null;
  }, [entries, entry?.id, date, odometerValue]);

  const distanceSincePrevious =
    previousEntry && Number.isFinite(odometerValue)
      ? round(odometerValue - Number(previousEntry.odometer), 1)
      : null;

  const preview = useMemo(() => {
    if (!Number.isFinite(odometerValue) || !Number.isFinite(litersValue)) return null;
    return computeFuelMetrics(
      odometerValue,
      litersValue,
      Number.isFinite(totalValue) ? totalValue : 0,
      date,
      entries ?? [],
      entry?.id,
      fullTank,
    );
  }, [odometerValue, litersValue, totalValue, date, entries, entry?.id, fullTank]);

  const financialMetrics = useMemo(() => {
    if (!preview) return null;
    const cycleLiters = Number(preview.cycleLiters ?? 0);
    const cycleCost = Number(preview.cycleCost ?? 0);
    const consumption = Number(preview.consumption ?? 0);
    const costPerKm = Number(preview.costPerKm ?? 0);
    return {
      cycleAveragePrice: cycleLiters > 0 ? round(cycleCost / cycleLiters, 3) : null,
      litersPer100Km: consumption > 0 ? round(100 / consumption, 2) : null,
      costPer100Km: costPerKm > 0 ? round(costPerKm * 100, 2) : null,
    };
  }, [preview]);

  const fuelCategoryId = useMemo(
    () =>
      (categories ?? []).find(
        (category) => category.type === "expense" && /combust/i.test(category.name),
      )?.id ?? null,
    [categories],
  );

  const warnings = useMemo(
    () =>
      odometerWarnings(
        odometerValue,
        litersValue,
        date,
        vehicle,
        entries ?? [],
        entry?.id,
        fullTank,
      ),
    [odometerValue, litersValue, date, vehicle, entries, entry?.id, fullTank],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!vehicleId) nextErrors.vehicle = "Selecione um veículo.";
    if (!date) nextErrors.date = "Informe a data.";
    if (date > isoDate(new Date())) nextErrors.date = "A data não pode ser futura.";
    if (!Number.isFinite(priceValue) || priceValue <= 0) nextErrors.price = "Informe o preço por litro.";
    if (!Number.isFinite(totalValue) || totalValue <= 0) nextErrors.total = "Informe o valor do abastecimento.";
    if (!Number.isFinite(litersValue) || litersValue <= 0) {
      nextErrors.liters = "Informe valor + preço por litro ou digite os litros abastecidos.";
    }
    if (litersValue > 1000) nextErrors.liters = "Quantidade de litros muito alta.";

    const odometerCheck = validateOdometer(
      odometerValue,
      date,
      vehicle,
      entries ?? [],
      entry?.id,
    );
    if (!odometerCheck.ok) nextErrors.odometer = odometerCheck.message;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (warnings.length > 0 && !acknowledged) {
      setAcknowledged(true);
      toast.warning("Confira os avisos e clique em salvar novamente para confirmar.");
      return;
    }

    const metrics = computeFuelMetrics(
      odometerValue,
      litersValue,
      toCents(totalValue),
      date,
      entries ?? [],
      entry?.id,
      fullTank,
    );

    const values = {
      vehicle_id: vehicleId,
      entry_date: date,
      odometer: odometerValue,
      liters: round(litersValue, 3),
      price_per_liter: round(priceValue, 3),
      total_amount: toCents(totalValue),
      fuel_type: fuelType,
      station: station ? sanitizeText(station) : null,
      full_tank: fullTank,
      fill_mode: fillMode,
      distance_since_previous: distanceSincePrevious,
      distance: metrics.distance,
      consumption: metrics.consumption,
      cost_per_km: metrics.costPerKm,
      notes: notes ? sanitizeText(notes) : null,
      attachment_url: attachment,
    };

    try {
      await save.mutateAsync({
        id: entry?.id,
        values,
        createTransaction:
          !entry && createExpense
            ? { categoryId: fuelCategoryId, accountId: accountId || null }
            : undefined,
      } as Parameters<typeof save.mutateAsync>[0]);

      await logAudit
        .mutateAsync({
          action: entry ? "update" : "create",
          vehicleId,
          fuelEntryId: entry?.id ?? null,
          odometerBefore: entry ? Number(entry.odometer) : null,
          odometerAfter: odometerValue,
          changes: diffValues(
            entry as unknown as Record<string, unknown> | null,
            values,
            Object.keys(values),
          ),
          warnings,
          notes: warnings.length > 0 ? "Salvo com avisos confirmados pelo usuário." : null,
        })
        .catch((error) => console.error("[auditoria] falha ao registrar", error));

      toast.success(entry ? "Abastecimento atualizado." : "Abastecimento adicionado.", {
        description: metrics.measurementComplete
          ? `Ciclo fechado: ${metrics.distance} km · ${metrics.consumption} km/l · ${formatCurrency(metrics.costPerKm ?? 0)}/km.`
          : fillMode === "partial"
            ? "Abastecimento parcial acumulado no ciclo atual."
            : "Abastecimento cheio salvo como ponto de medição.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("[abastecimentos] falha ao salvar", error);
      toast.error("Não foi possível salvar o abastecimento.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar abastecimento" : "Novo abastecimento"}</DialogTitle>
          <DialogDescription>
            Informe o valor pago e o preço por litro. O sistema calcula os litros automaticamente e compara o odômetro com o abastecimento anterior.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          data-1p-ignore
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <div className="sm:col-span-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle ? <p className="mt-1 text-xs text-destructive">{errors.vehicle}</p> : null}
          </div>

          <div>
            <Label htmlFor="fuel-date">Data</Label>
            <Input
              id="fuel-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1.5"
            />
            {errors.date ? <p className="mt-1 text-xs text-destructive">{errors.date}</p> : null}
          </div>

          <div>
            <Label htmlFor="fuel-odometer">Odômetro atual (km)</Label>
            <Input
              id="fuel-odometer"
              inputMode="decimal"
              value={odometer}
              onChange={(event) => setOdometer(maskDecimalInput(event.target.value, 1))}
              className="mt-1.5 tabular-nums"
              placeholder="Ex.: 58.230"
            />
            {errors.odometer ? <p className="mt-1 text-xs text-destructive">{errors.odometer}</p> : null}
          </div>

          {previousEntry && distanceSincePrevious != null && distanceSincePrevious > 0 ? (
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:col-span-2">
              <div className="flex items-start gap-3">
                <Route className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{distanceSincePrevious} km desde o último abastecimento</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Último registro: {formatDate(previousEntry.entry_date)} · odômetro {previousEntry.odometer} km. Esta distância é independente da distância total do ciclo de consumo.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-card p-3">
            <Label htmlFor="fuel-total">Valor pago (R$)</Label>
            <Input
              id="fuel-total"
              inputMode="decimal"
              value={displayedTotal}
              onChange={(event) => {
                setCalculationSource("total");
                setTotal(maskAmountInput(event.target.value));
              }}
              className="mt-1.5 tabular-nums"
              placeholder="Ex.: 200,00"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Ao informar o preço por litro, os litros são calculados automaticamente.</p>
            {errors.total ? <p className="mt-1 text-xs text-destructive">{errors.total}</p> : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <Label htmlFor="fuel-price">Preço do combustível (R$/L)</Label>
            <Input
              id="fuel-price"
              inputMode="decimal"
              value={pricePerLiter}
              onChange={(event) => setPricePerLiter(maskDecimalInput(event.target.value, 3))}
              className="mt-1.5 tabular-nums"
              placeholder="Ex.: 6,199"
            />
            {errors.price ? <p className="mt-1 text-xs text-destructive">{errors.price}</p> : null}
          </div>

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor="fuel-liters">Litros abastecidos</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {calculationSource === "total"
                    ? "Calculado automaticamente por valor pago ÷ preço por litro."
                    : "Modo manual: ao alterar litros, o valor total passa a ser calculado pelos litros."}
                </p>
              </div>
              <Calculator className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </div>
            <Input
              id="fuel-liters"
              inputMode="decimal"
              value={displayedLiters}
              onChange={(event) => {
                setCalculationSource("liters");
                setLiters(maskDecimalInput(event.target.value, 3));
              }}
              className="mt-2 tabular-nums"
              placeholder="0,000"
            />
            {calculationSource === "total" && Number.isFinite(calculatedLiters) ? (
              <p className="mt-2 text-sm font-semibold tabular-nums text-primary">
                {decimalInput(calculatedLiters)} L = {formatCurrency(enteredTotal)} ÷ {formatCurrency(priceValue)}/L
              </p>
            ) : calculationSource === "liters" && Number.isFinite(calculatedTotal) ? (
              <p className="mt-2 text-sm font-semibold tabular-nums text-primary">
                Total calculado: {formatCurrency(calculatedTotal)}
              </p>
            ) : null}
            {errors.liters ? <p className="mt-1 text-xs text-destructive">{errors.liters}</p> : null}
          </div>

          <div>
            <Label>Combustível</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuel-station">Posto</Label>
            <Input
              id="fuel-station"
              value={station}
              onChange={(event) => setStation(event.target.value)}
              maxLength={80}
              className="mt-1.5"
              placeholder="Nome do posto"
            />
          </div>

          <div className="rounded-xl border border-border p-4 sm:col-span-2">
            <Label>Como foi este abastecimento?</Label>
            <Select value={fillMode} onValueChange={(value) => setFillMode(value as FillMode)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILL_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {FILL_MODES.find((mode) => mode.value === fillMode)?.description}
            </p>
          </div>

          {preview ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm sm:col-span-2">
              {preview.baselineOdometer == null ? (
                <>
                  <p className="font-semibold">Primeiro ponto de medição</p>
                  <p className="mt-1 text-muted-foreground">
                    Se o tanque ficou cheio, este registro vira a referência. No próximo abastecimento que terminar cheio, o sistema fecha a primeira média precisa.
                  </p>
                </>
              ) : preview.measurementComplete ? (
                <>
                  <p className="font-semibold">Prévia inteligente do ciclo completo</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Km desde abastecimento anterior</span><strong className="mt-1 block tabular-nums">{distanceSincePrevious ?? "—"} km</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Distância do ciclo</span><strong className="mt-1 block tabular-nums">{preview.distance} km</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Combustível no ciclo</span><strong className="mt-1 block tabular-nums">{preview.cycleLiters} L</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Consumo médio</span><strong className="mt-1 block tabular-nums">{preview.consumption} km/l</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Custo por km</span><strong className="mt-1 block tabular-nums">{formatCurrency(preview.costPerKm ?? 0)}/km</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Preço médio do litro</span><strong className="mt-1 block tabular-nums">{financialMetrics?.cycleAveragePrice != null ? `${formatCurrency(financialMetrics.cycleAveragePrice)}/L` : "—"}</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Litros por 100 km</span><strong className="mt-1 block tabular-nums">{financialMetrics?.litersPer100Km != null ? `${financialMetrics.litersPer100Km} L` : "—"}</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Custo por 100 km</span><strong className="mt-1 block tabular-nums">{financialMetrics?.costPer100Km != null ? formatCurrency(financialMetrics.costPer100Km) : "—"}</strong></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold">Ciclo em andamento</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <span><strong>{distanceSincePrevious ?? "—"}</strong> km desde o último abastecimento</span>
                    <span><strong>{preview.distance ?? 0}</strong> km desde a referência cheia</span>
                    <span><strong>{preview.cycleLiters ?? 0}</strong> L acumulados</span>
                    <span><strong>{formatCurrency(preview.cycleCost ?? 0)}</strong> gastos</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    A média km/l será fechada quando o tanque terminar cheio novamente.
                  </p>
                </>
              )}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm sm:col-span-2">
              <p className="flex items-center gap-2 font-medium"><TriangleAlert className="size-4" />Variações fora do padrão</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
              {acknowledged ? <p className="mt-2 text-xs font-medium">Clique em salvar novamente para confirmar mesmo assim.</p> : null}
            </div>
          ) : null}

          {!entry ? (
            <>
              <div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2">
                <Label htmlFor="fuel-expense" className="text-sm font-normal">Lançar também como despesa</Label>
                <Switch id="fuel-expense" checked={createExpense} onCheckedChange={setCreateExpense} />
              </div>
              {createExpense ? (
                <div className="sm:col-span-2">
                  <Label>Conta (opcional)</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sem conta" /></SelectTrigger>
                    <SelectContent>
                      {(accounts ?? []).map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="sm:col-span-2">
            <ReceiptField value={attachment} onChange={setAttachment} label="Comprovante / nota" />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="fuel-notes">Observações</Label>
            <Textarea
              id="fuel-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1.5"
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Salvar abastecimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
