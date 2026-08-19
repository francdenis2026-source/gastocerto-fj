import { useMemo, useState } from "react";
import { Calculator, Loader2, TriangleAlert } from "lucide-react";
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
import { formatCurrency } from "@/lib/format-utils";
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
  const [totalTouched, setTotalTouched] = useState(false);
  const [total, setTotal] = useState(
    entry ? String(entry.total_amount).replace(".", ",") : "",
  );
  const [fuelType, setFuelType] = useState(entry?.fuel_type ?? "gasolina");
  const [station, setStation] = useState(entry?.station ?? "");
  const [fullTank, setFullTank] = useState(entry?.full_tank ?? true);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [attachment, setAttachment] = useState<string | null>(entry?.attachment_url ?? null);
  const [createExpense, setCreateExpense] = useState(!entry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);

  const vehicle = vehicles.find((item) => item.id === vehicleId);

  const enteredLiters = parseAmount(liters);
  const priceValue = parseAmount(pricePerLiter);
  const enteredTotal = parseAmount(total);

  const autoLiters =
    totalTouched && Number.isFinite(enteredTotal) && enteredTotal > 0 && Number.isFinite(priceValue) && priceValue > 0
      ? round(enteredTotal / priceValue, 3)
      : Number.NaN;

  const litersValue = Number.isFinite(autoLiters) ? autoLiters : enteredLiters;
  const computedTotal = totalTouched
    ? enteredTotal
    : Number.isFinite(litersValue) && Number.isFinite(priceValue)
      ? toCents(litersValue * priceValue)
      : Number.NaN;

  const displayedLiters = Number.isFinite(autoLiters) ? decimalInput(autoLiters) : liters;
  const displayedTotal = totalTouched
    ? total
    : Number.isFinite(computedTotal)
      ? decimalInput(computedTotal, 2)
      : "";

  const preview = useMemo(() => {
    const odometerValue = parseAmount(odometer);
    if (!Number.isFinite(odometerValue) || !Number.isFinite(litersValue)) return null;
    return computeFuelMetrics(
      odometerValue,
      litersValue,
      Number.isFinite(computedTotal) ? computedTotal : 0,
      date,
      entries ?? [],
      entry?.id,
      fullTank,
    );
  }, [odometer, litersValue, computedTotal, date, entries, entry?.id, fullTank]);

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
  const [accountId, setAccountId] = useState("");

  const warnings = useMemo(
    () =>
      odometerWarnings(
        parseAmount(odometer),
        litersValue,
        date,
        vehicle,
        entries ?? [],
        entry?.id,
        fullTank,
      ),
    [odometer, litersValue, date, vehicle, entries, entry?.id, fullTank],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const odometerValue = parseAmount(odometer);
    const totalValue = Number.isFinite(computedTotal) ? toCents(computedTotal) : Number.NaN;

    if (!vehicleId) nextErrors.vehicle = "Selecione um veículo.";
    if (!date) nextErrors.date = "Informe a data.";
    if (date > isoDate(new Date())) nextErrors.date = "A data não pode ser futura.";
    if (!Number.isFinite(priceValue) || priceValue <= 0) nextErrors.price = "Informe o preço por litro.";
    if (!Number.isFinite(totalValue) || totalValue <= 0) nextErrors.total = "Informe o valor total abastecido.";
    if (!Number.isFinite(litersValue) || litersValue <= 0) {
      nextErrors.liters = "Informe os litros ou preencha valor total + preço por litro para calcular automaticamente.";
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
      totalValue,
      date,
      entries ?? [],
      entry?.id,
      fullTank,
    );

    try {
      await save.mutateAsync({
        id: entry?.id,
        values: {
          vehicle_id: vehicleId,
          entry_date: date,
          odometer: odometerValue,
          liters: round(litersValue, 3),
          price_per_liter: round(priceValue, 3),
          total_amount: totalValue,
          fuel_type: fuelType,
          station: station ? sanitizeText(station) : null,
          full_tank: fullTank,
          distance: metrics.distance,
          consumption: metrics.consumption,
          cost_per_km: metrics.costPerKm,
          notes: notes ? sanitizeText(notes) : null,
          attachment_url: attachment,
        },
        createTransaction:
          !entry && createExpense
            ? { categoryId: fuelCategoryId, accountId: accountId || null }
            : undefined,
      });
      const values = {
        entry_date: date,
        odometer: odometerValue,
        liters: round(litersValue, 3),
        price_per_liter: round(priceValue, 3),
        total_amount: totalValue,
        fuel_type: fuelType,
        station: station ? sanitizeText(station) : null,
        full_tank: fullTank,
        notes: notes ? sanitizeText(notes) : null,
        attachment_url: attachment,
      };

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
          : fullTank
            ? "Este tanque cheio foi salvo como referência para a próxima medição."
            : "Abastecimento parcial acumulado no ciclo atual.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("[abastecimentos] falha ao salvar", error);
      toast.error("Não foi possível salvar o abastecimento.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar abastecimento" : "Novo abastecimento"}</DialogTitle>
          <DialogDescription>
            Informe o valor pago e o preço por litro para calcular automaticamente quantos litros foram abastecidos. Se preferir, informe os litros e o sistema calcula o total.
          </DialogDescription>
        </DialogHeader>

        <form autoComplete="off" data-1p-ignore onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
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
            <Input id="fuel-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5" />
            <p className="mt-1.5 text-xs text-muted-foreground">Aceita abastecimentos de dias e meses anteriores.</p>
            {errors.date ? <p className="mt-1 text-xs text-destructive">{errors.date}</p> : null}
          </div>

          <div>
            <Label htmlFor="fuel-odometer">Odômetro (km)</Label>
            <Input id="fuel-odometer" inputMode="decimal" value={odometer} onChange={(event) => setOdometer(maskDecimalInput(event.target.value, 1))} className="mt-1.5 tabular-nums" placeholder="Ex.: 58230" />
            {errors.odometer ? <p className="mt-1 text-xs text-destructive">{errors.odometer}</p> : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <Label htmlFor="fuel-total">Valor do abastecimento (R$)</Label>
            <Input
              id="fuel-total"
              inputMode="decimal"
              value={displayedTotal}
              onChange={(event) => {
                setTotalTouched(true);
                setTotal(maskAmountInput(event.target.value));
              }}
              className="mt-1.5 tabular-nums"
              placeholder="Ex.: 200,00"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Digite quanto pagou no posto.</p>
            {errors.total ? <p className="mt-1 text-xs text-destructive">{errors.total}</p> : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <Label htmlFor="fuel-price">Preço no posto (R$/L)</Label>
            <Input
              id="fuel-price"
              inputMode="decimal"
              value={pricePerLiter}
              onChange={(event) => setPricePerLiter(maskDecimalInput(event.target.value, 3))}
              className="mt-1.5 tabular-nums"
              placeholder="Ex.: 6,199"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Preço de 1 litro do combustível.</p>
            {errors.price ? <p className="mt-1 text-xs text-destructive">{errors.price}</p> : null}
          </div>

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="fuel-liters">Litros abastecidos</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Number.isFinite(autoLiters)
                    ? "Calculado automaticamente: valor total ÷ preço por litro."
                    : "Você também pode informar os litros; o valor total será calculado automaticamente."}
                </p>
              </div>
              {Number.isFinite(autoLiters) ? <Calculator className="size-5 text-primary" aria-hidden="true" /> : null}
            </div>
            <Input
              id="fuel-liters"
              inputMode="decimal"
              value={displayedLiters}
              onChange={(event) => {
                setTotalTouched(false);
                setLiters(maskDecimalInput(event.target.value, 3));
              }}
              className="mt-2 tabular-nums"
              placeholder="0,000"
            />
            {Number.isFinite(autoLiters) ? (
              <p className="mt-2 text-sm font-semibold tabular-nums text-primary">
                {decimalInput(autoLiters)} L por {formatCurrency(enteredTotal)} a {formatCurrency(priceValue)}/L
              </p>
            ) : null}
            {errors.liters ? <p className="mt-1 text-xs text-destructive">{errors.liters}</p> : null}
          </div>

          <div>
            <Label>Combustível</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuel-station">Posto</Label>
            <Input id="fuel-station" value={station} onChange={(event) => setStation(event.target.value)} maxLength={80} className="mt-1.5" placeholder="Nome do posto" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-2">
            <div>
              <Label htmlFor="fuel-full" className="text-sm font-medium">Completei o tanque</Label>
              <p className="mt-1 text-xs text-muted-foreground">Ative quando o abastecimento deixar o tanque cheio. Isso fecha o ciclo e gera a média precisa.</p>
            </div>
            <Switch id="fuel-full" checked={fullTank} onCheckedChange={setFullTank} />
          </div>

          {preview ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm sm:col-span-2">
              {preview.baselineOdometer == null ? (
                <>
                  <p className="font-semibold">Primeira referência de consumo</p>
                  <p className="mt-1 text-muted-foreground">Salve este abastecimento com o tanque cheio. A partir do próximo tanque cheio o sistema calculará automaticamente consumo e custos reais.</p>
                </>
              ) : preview.measurementComplete ? (
                <>
                  <p className="font-semibold">Prévia inteligente do ciclo completo</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Distância</span><strong className="mt-1 block tabular-nums">{preview.distance} km</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Combustível consumido</span><strong className="mt-1 block tabular-nums">{preview.cycleLiters} L</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Consumo médio</span><strong className="mt-1 block tabular-nums">{preview.consumption} km/l</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Custo por km</span><strong className="mt-1 block tabular-nums">{formatCurrency(preview.costPerKm ?? 0)}/km</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Preço médio do litro consumido</span><strong className="mt-1 block tabular-nums">{financialMetrics?.cycleAveragePrice != null ? `${formatCurrency(financialMetrics.cycleAveragePrice)}/L` : "—"}</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Litros por 100 km</span><strong className="mt-1 block tabular-nums">{financialMetrics?.litersPer100Km != null ? `${financialMetrics.litersPer100Km} L` : "—"}</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Custo por 100 km</span><strong className="mt-1 block tabular-nums">{financialMetrics?.costPer100Km != null ? formatCurrency(financialMetrics.costPer100Km) : "—"}</strong></div>
                    <div className="rounded-lg bg-background/70 p-3"><span className="text-xs text-muted-foreground">Gasto do ciclo</span><strong className="mt-1 block tabular-nums">{formatCurrency(preview.cycleCost ?? 0)}</strong></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold">Ciclo de consumo em andamento</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <span><strong>{preview.distance ?? 0}</strong> km desde a referência</span>
                    <span><strong>{preview.cycleLiters ?? 0}</strong> L acumulados</span>
                    <span><strong>{formatCurrency(preview.cycleCost ?? 0)}</strong> gastos</span>
                  </div>
                  {financialMetrics?.cycleAveragePrice != null ? (
                    <p className="mt-2 text-xs text-muted-foreground">Preço médio do combustível no ciclo até agora: {formatCurrency(financialMetrics.cycleAveragePrice)}/L.</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">A média km/l e o custo real por distância serão fechados no próximo abastecimento marcado como tanque cheio.</p>
                </>
              )}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm sm:col-span-2">
              <p className="flex items-center gap-2 font-medium"><TriangleAlert className="size-4" />Variações fora do padrão</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
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
                    <SelectContent>{(accounts ?? []).map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="sm:col-span-2"><ReceiptField value={attachment} onChange={setAttachment} label="Comprovante / nota" /></div>

          <div className="sm:col-span-2">
            <Label htmlFor="fuel-notes">Observações</Label>
            <Textarea id="fuel-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={2} className="mt-1.5" />
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
