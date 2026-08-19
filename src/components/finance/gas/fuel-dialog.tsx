import { useEffect, useMemo, useState } from "react";
import { Calculator, Fuel, Loader2, Route, TriangleAlert } from "lucide-react";
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
    description: "O tanque terminou cheio. Este abastecimento pode fechar uma medição completa de consumo.",
  },
  {
    value: "top_off",
    label: "Só completei até encher",
    description: "Já havia combustível e você completou até ficar cheio. Também fecha uma medição completa.",
  },
  {
    value: "partial",
    label: "Abastecimento parcial",
    description: "O tanque não ficou cheio. O valor e os litros entram no ciclo, mas a média será fechada depois.",
  },
];

const PRIMARY_FUELS = ["gasolina", "gasolina_aditivada", "etanol"];

function decimalInput(value: number, digits = 3) {
  return value.toFixed(digits).replace(".", ",");
}

function priceInput(value: number) {
  return decimalInput(value, 3);
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

  const [vehicleId, setVehicleId] = useState(entry?.vehicle_id ?? defaultVehicleId ?? vehicles[0]?.id ?? "");
  const { data: entries } = useFuelEntries(vehicleId || undefined);

  const [date, setDate] = useState(entry?.entry_date ?? isoDate(new Date()));
  const [odometer, setOdometer] = useState(entry ? String(entry.odometer) : "");
  const [fuelType, setFuelType] = useState(entry?.fuel_type ?? "gasolina");
  const [station, setStation] = useState(entry?.station ?? "");
  const [pricePerLiter, setPricePerLiter] = useState(entry ? String(entry.price_per_liter).replace(".", ",") : "");
  const [priceTouched, setPriceTouched] = useState(Boolean(entry));
  const [total, setTotal] = useState(entry ? maskAmountInput(String(Math.round(Number(entry.total_amount) * 100))) : "");
  const [liters, setLiters] = useState(entry ? String(entry.liters).replace(".", ",") : "");
  const [calculationSource, setCalculationSource] = useState<CalculationSource>(entry ? "liters" : "total");
  const [fillMode, setFillMode] = useState<FillMode>(initialFillMode);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [attachment, setAttachment] = useState<string | null>(entry?.attachment_url ?? null);
  const [createExpense, setCreateExpense] = useState(!entry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [accountId, setAccountId] = useState("");

  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const fullTank = fillMode !== "partial";

  const latestPriceEntry = useMemo(() => {
    return (entries ?? [])
      .filter((item) => item.id !== entry?.id && item.fuel_type === fuelType && Number(item.price_per_liter) > 0)
      .slice()
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer))[0] ?? null;
  }, [entries, entry?.id, fuelType]);

  useEffect(() => {
    if (entry || priceTouched) return;
    if (latestPriceEntry) setPricePerLiter(priceInput(Number(latestPriceEntry.price_per_liter)));
    else setPricePerLiter("");
  }, [entry, latestPriceEntry, priceTouched]);

  const enteredLiters = parseAmount(liters);
  const priceValue = parseAmount(pricePerLiter);
  const enteredTotal = parseAmount(total);

  const calculatedLiters =
    calculationSource === "total" && Number.isFinite(enteredTotal) && enteredTotal > 0 && Number.isFinite(priceValue) && priceValue > 0
      ? round(enteredTotal / priceValue, 3)
      : Number.NaN;

  const calculatedTotal =
    calculationSource === "liters" && Number.isFinite(enteredLiters) && enteredLiters > 0 && Number.isFinite(priceValue) && priceValue > 0
      ? toCents(enteredLiters * priceValue)
      : Number.NaN;

  const litersValue = calculationSource === "total" ? calculatedLiters : enteredLiters;
  const totalValue = calculationSource === "liters" ? calculatedTotal : enteredTotal;
  const displayedLiters = calculationSource === "total" && Number.isFinite(calculatedLiters) ? decimalInput(calculatedLiters) : liters;
  const displayedTotal = calculationSource === "liters" && Number.isFinite(calculatedTotal) ? decimalInput(calculatedTotal, 2) : total;
  const odometerValue = parseAmount(odometer);

  const previousEntry = useMemo(() => {
    if (!Number.isFinite(odometerValue)) return null;
    return (entries ?? [])
      .filter((item) => item.id !== entry?.id)
      .filter((item) => item.entry_date < date || (item.entry_date === date && Number(item.odometer) < odometerValue))
      .slice()
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer))[0] ?? null;
  }, [entries, entry?.id, date, odometerValue]);

  const distanceSincePrevious = previousEntry && Number.isFinite(odometerValue)
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
    () => (categories ?? []).find((category) => category.type === "expense" && /combust/i.test(category.name))?.id ?? null,
    [categories],
  );

  const warnings = useMemo(
    () => odometerWarnings(odometerValue, litersValue, date, vehicle, entries ?? [], entry?.id, fullTank),
    [odometerValue, litersValue, date, vehicle, entries, entry?.id, fullTank],
  );

  function selectFuel(value: string) {
    setFuelType(value);
    setPriceTouched(false);
    setPricePerLiter("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!vehicleId) nextErrors.vehicle = "Selecione um veículo.";
    if (!date) nextErrors.date = "Informe a data.";
    if (date > isoDate(new Date())) nextErrors.date = "A data não pode ser futura.";
    if (!fuelType) nextErrors.fuel = "Informe o combustível abastecido.";
    if (!Number.isFinite(priceValue) || priceValue <= 0) nextErrors.price = "Informe o preço por litro do posto.";
    if (!Number.isFinite(totalValue) || totalValue <= 0) nextErrors.total = "Informe o valor pago.";
    if (!Number.isFinite(litersValue) || litersValue <= 0) nextErrors.liters = "Confira valor pago e preço por litro.";
    if (litersValue > 1000) nextErrors.liters = "Quantidade de litros muito alta.";

    const odometerCheck = validateOdometer(odometerValue, date, vehicle, entries ?? [], entry?.id);
    if (!odometerCheck.ok) nextErrors.odometer = odometerCheck.message;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (warnings.length > 0 && !acknowledged) {
      setAcknowledged(true);
      toast.warning("Confira os avisos e clique em salvar novamente para confirmar.");
      return;
    }

    const metrics = computeFuelMetrics(odometerValue, litersValue, toCents(totalValue), date, entries ?? [], entry?.id, fullTank);

    // Mantemos o payload principal compatível com o schema antigo de produção.
    // fill_mode e distance_since_previous continuam na interface/auditoria e podem
    // voltar ao payload assim que a migration opcional estiver aplicada no banco.
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
      distance: metrics.distance,
      consumption: metrics.consumption,
      cost_per_km: metrics.costPerKm,
      notes: notes ? sanitizeText(notes) : null,
      attachment_url: attachment,
    };

    const auditValues = {
      ...values,
      fill_mode: fillMode,
      distance_since_previous: distanceSincePrevious,
    };

    try {
      await save.mutateAsync({
        id: entry?.id,
        values,
        createTransaction: !entry && createExpense ? { categoryId: fuelCategoryId, accountId: accountId || null } : undefined,
      } as Parameters<typeof save.mutateAsync>[0]);

      await logAudit.mutateAsync({
        action: entry ? "update" : "create",
        vehicleId,
        fuelEntryId: entry?.id ?? null,
        odometerBefore: entry ? Number(entry.odometer) : null,
        odometerAfter: odometerValue,
        changes: diffValues(entry as unknown as Record<string, unknown> | null, auditValues, Object.keys(auditValues)),
        warnings,
        notes: warnings.length > 0 ? "Salvo com avisos confirmados pelo usuário." : null,
      }).catch((error) => console.error("[auditoria] falha ao registrar", error));

      toast.success(entry ? "Abastecimento atualizado." : "Abastecimento adicionado.", {
        description: metrics.measurementComplete
          ? `Ciclo fechado: ${metrics.distance} km · ${metrics.consumption} km/l · ${formatCurrency(metrics.costPerKm ?? 0)}/km.`
          : fillMode === "partial" ? "Abastecimento parcial acumulado no ciclo atual." : "Abastecimento cheio salvo como ponto de medição.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("[abastecimentos] falha ao salvar", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Não foi possível salvar o abastecimento.", {
        description: message.includes("column") || message.includes("schema")
          ? "O banco ainda está atualizando. Tente novamente; o formulário já está compatível com a versão anterior."
          : message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Fuel className="size-5 text-primary" />{entry ? "Editar abastecimento" : "Registrar abastecimento"}</DialogTitle>
          <DialogDescription>
            Selecione o combustível, confirme o preço do posto e informe quanto pagou. O GastoCerto calcula os litros e a distância automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form autoComplete="off" data-1p-ignore onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <section className="grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:col-span-2 sm:grid-cols-2">
            <div>
              <Label>Veículo</Label>
              <Select value={vehicleId} onValueChange={(value) => { setVehicleId(value); setPriceTouched(false); setPricePerLiter(""); }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{vehicles.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.vehicle ? <p className="mt-1 text-xs text-destructive">{errors.vehicle}</p> : null}
            </div>
            <div>
              <Label htmlFor="fuel-date">Data</Label>
              <Input id="fuel-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5" />
              {errors.date ? <p className="mt-1 text-xs text-destructive">{errors.date}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border p-4 sm:col-span-2">
            <div className="mb-3">
              <p className="text-sm font-semibold">1. Qual combustível você abasteceu?</p>
              <p className="mt-1 text-xs text-muted-foreground">Cada combustível mantém seu próprio último preço. Etanol/álcool nunca reutiliza o preço da gasolina.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {FUEL_TYPES.filter((item) => PRIMARY_FUELS.includes(item.value)).map((item) => (
                <button key={item.value} type="button" onClick={() => selectFuel(item.value)} className={`min-h-14 rounded-xl border px-3 py-2 text-left transition-colors ${fuelType === item.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card hover:bg-muted/50"}`} aria-pressed={fuelType === item.value}>
                  <span className="block text-sm font-semibold">{item.value === "etanol" ? "Etanol / Álcool" : item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.value === "gasolina" ? "Gasolina comum" : item.value === "gasolina_aditivada" ? "Gasolina aditivada" : "Preço independente"}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Select value={fuelType} onValueChange={selectFuel}>
                <SelectTrigger aria-label="Outros tipos de combustível"><SelectValue /></SelectTrigger>
                <SelectContent>{FUEL_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.value === "etanol" ? "Etanol / Álcool" : item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {errors.fuel ? <p className="mt-1 text-xs text-destructive">{errors.fuel}</p> : null}
          </section>

          <section className="grid gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Label htmlFor="fuel-price">Preço no posto (R$/L)</Label>
              <Input id="fuel-price" inputMode="decimal" value={pricePerLiter} onChange={(event) => { setPriceTouched(true); setPricePerLiter(maskDecimalInput(event.target.value, 3)); }} className="mt-1.5 tabular-nums" placeholder="Ex.: 6,199" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {latestPriceEntry && !priceTouched ? `Preenchido pelo último ${fuelType === "etanol" ? "etanol/álcool" : "abastecimento"}: ${formatCurrency(Number(latestPriceEntry.price_per_liter))}/L em ${formatDate(latestPriceEntry.entry_date)}.` : "Você pode alterar este preço a qualquer momento. O valor salvo será sugerido no próximo abastecimento deste combustível."}
              </p>
              {errors.price ? <p className="mt-1 text-xs text-destructive">{errors.price}</p> : null}
            </div>
            <div>
              <Label htmlFor="fuel-total">Valor pago (R$)</Label>
              <Input id="fuel-total" inputMode="decimal" value={displayedTotal} onChange={(event) => { setCalculationSource("total"); setTotal(maskAmountInput(event.target.value)); }} className="mt-1.5 tabular-nums" placeholder="Ex.: 200,00" />
              {errors.total ? <p className="mt-1 text-xs text-destructive">{errors.total}</p> : null}
            </div>
            <div>
              <Label htmlFor="fuel-liters">Litros calculados</Label>
              <Input id="fuel-liters" inputMode="decimal" value={displayedLiters} onChange={(event) => { setCalculationSource("liters"); setLiters(maskDecimalInput(event.target.value, 3)); }} className="mt-1.5 tabular-nums" placeholder="Automático" />
              {errors.liters ? <p className="mt-1 text-xs text-destructive">{errors.liters}</p> : null}
            </div>
            <div className="rounded-xl bg-background/80 p-3 sm:col-span-2 lg:col-span-4">
              {calculationSource === "total" && Number.isFinite(calculatedLiters) ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Calculator className="size-4" />{decimalInput(calculatedLiters)} L calculados automaticamente = {formatCurrency(enteredTotal)} ÷ {formatCurrency(priceValue)}/L</p>
              ) : calculationSource === "liters" && Number.isFinite(calculatedTotal) ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Calculator className="size-4" />Valor calculado automaticamente: {formatCurrency(calculatedTotal)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Informe preço por litro e valor pago para obter os litros automaticamente.</p>
              )}
            </div>
          </section>

          <div>
            <Label htmlFor="fuel-odometer">Odômetro atual (km)</Label>
            <Input id="fuel-odometer" inputMode="decimal" value={odometer} onChange={(event) => setOdometer(maskDecimalInput(event.target.value, 1))} className="mt-1.5 tabular-nums" placeholder="Ex.: 58230" />
            {errors.odometer ? <p className="mt-1 text-xs text-destructive">{errors.odometer}</p> : null}
          </div>
          <div>
            <Label htmlFor="fuel-station">Posto</Label>
            <Input id="fuel-station" value={station} onChange={(event) => setStation(event.target.value)} maxLength={80} className="mt-1.5" placeholder="Nome do posto" />
          </div>

          {previousEntry && distanceSincePrevious != null && distanceSincePrevious > 0 ? (
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:col-span-2">
              <div className="flex items-start gap-3"><Route className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-semibold">{distanceSincePrevious} km desde o abastecimento anterior</p><p className="mt-1 text-xs text-muted-foreground">Anterior: {formatDate(previousEntry.entry_date)} · {previousEntry.odometer} km. Atual: {odometerValue} km.</p></div></div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-border p-4 sm:col-span-2">
            <Label>2. Como terminou o tanque?</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {FILL_MODES.map((mode) => (
                <button key={mode.value} type="button" onClick={() => setFillMode(mode.value)} className={`min-h-20 rounded-xl border p-3 text-left transition-colors ${fillMode === mode.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`} aria-pressed={fillMode === mode.value}><span className="block text-sm font-semibold">{mode.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{mode.description}</span></button>
              ))}
            </div>
          </section>

          {preview ? (
            <section className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm sm:col-span-2">
              <p className="font-semibold">Leitura inteligente</p>
              {preview.baselineOdometer == null ? (
                <p className="mt-1 text-muted-foreground">Se o tanque terminou cheio, este registro vira a referência para a próxima medição precisa.</p>
              ) : preview.measurementComplete ? (
                <div className="mt-3 grid gap-2 grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Desde o anterior</span><strong className="mt-1 block">{distanceSincePrevious ?? "—"} km</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Ciclo completo</span><strong className="mt-1 block">{preview.distance} km</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Consumo</span><strong className="mt-1 block">{preview.consumption} km/l</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Custo/km</span><strong className="mt-1 block">{formatCurrency(preview.costPerKm ?? 0)}</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Litros no ciclo</span><strong className="mt-1 block">{preview.cycleLiters} L</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">Preço médio/L</span><strong className="mt-1 block">{financialMetrics?.cycleAveragePrice != null ? formatCurrency(financialMetrics.cycleAveragePrice) : "—"}</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">L/100 km</span><strong className="mt-1 block">{financialMetrics?.litersPer100Km ?? "—"}</strong></div>
                  <div className="rounded-xl bg-background p-3"><span className="text-xs text-muted-foreground">R$/100 km</span><strong className="mt-1 block">{financialMetrics?.costPer100Km != null ? formatCurrency(financialMetrics.costPer100Km) : "—"}</strong></div>
                </div>
              ) : (
                <p className="mt-1 text-muted-foreground">Ciclo em andamento: {preview.distance ?? 0} km desde a referência · {preview.cycleLiters ?? 0} L · {formatCurrency(preview.cycleCost ?? 0)} acumulados.</p>
              )}
            </section>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm sm:col-span-2"><p className="flex items-center gap-2 font-medium"><TriangleAlert className="size-4" />Variações fora do padrão</p><ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>{acknowledged ? <p className="mt-2 text-xs font-medium">Clique em salvar novamente para confirmar.</p> : null}</div>
          ) : null}

          {!entry ? <><div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2"><Label htmlFor="fuel-expense" className="text-sm font-normal">Lançar também como despesa</Label><Switch id="fuel-expense" checked={createExpense} onCheckedChange={setCreateExpense} /></div>{createExpense ? <div className="sm:col-span-2"><Label>Conta (opcional)</Label><Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Sem conta" /></SelectTrigger><SelectContent>{(accounts ?? []).map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></div> : null}</> : null}

          <div className="sm:col-span-2"><ReceiptField value={attachment} onChange={setAttachment} label="Comprovante / nota" /></div>
          <div className="sm:col-span-2"><Label htmlFor="fuel-notes">Observações</Label><Textarea id="fuel-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={2} className="mt-1.5" /></div>

          <DialogFooter className="sm:col-span-2"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Salvar abastecimento</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
