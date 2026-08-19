import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  Download,
  Droplets,
  Fuel,
  Gauge,
  History,
  Pencil,
  Plus,
  ReceiptText,
  Settings2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { FeatureGate } from "@/components/finance/feature-gate";
import { FuelDialog } from "@/components/finance/gas/fuel-dialog";
import { FuelCycleChart } from "@/components/finance/gas/fuel-cycle-chart";
import { ReceiptViewer } from "@/components/finance/receipt-viewer";
import { VehicleDialog } from "@/components/finance/dialogs/vehicle-dialog";
import { VehicleEmblem } from "@/components/finance/vehicle-emblem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { labelFor } from "@/lib/finance";
import {
  FUEL_TYPES,
  VEHICLE_TYPES,
  downloadCsv,
  fuelStatsCsv,
  statsByVehicle,
  summarizeFuel,
  useDeleteFuelEntry,
  useDeleteVehicle,
  useFuelEntries,
  useVehicles,
  type FuelEntry,
  type Vehicle,
} from "@/lib/vehicles";

export const Route = createFileRoute("/_authenticated/veiculos")({
  head: () => ({
    meta: [
      { title: "Veículos e combustível — GastoCerto" },
      {
        name: "description",
        content: "Controle inteligente de abastecimentos, consumo, preço por litro e custo por quilômetro.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data: entries, isLoading: loadingEntries } = useFuelEntries(
    vehicleFilter === "all" ? undefined : vehicleFilter,
  );

  const deleteVehicle = useDeleteVehicle();
  const deleteEntry = useDeleteFuelEntry();
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [fuelDialog, setFuelDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<FuelEntry | null>(null);

  const filtered = useMemo(() => {
    return (entries ?? []).filter((entry) => {
      if (fuelFilter !== "all" && entry.fuel_type !== fuelFilter) return false;
      if (from && entry.entry_date < from) return false;
      if (to && entry.entry_date > to) return false;
      return true;
    });
  }, [entries, fuelFilter, from, to]);

  const summary = useMemo(() => summarizeFuel(filtered), [filtered]);
  const perVehicle = useMemo(
    () => statsByVehicle(
      (vehicles ?? []).filter((vehicle) => vehicleFilter === "all" || vehicle.id === vehicleFilter),
      filtered,
    ).filter((item) => item.summary.entries > 0),
    [vehicles, filtered, vehicleFilter],
  );

  const selectedVehicle = (vehicles ?? []).find((vehicle) => vehicle.id === vehicleFilter) ?? null;
  const latestEntry = useMemo(
    () => filtered.slice().sort((a, b) => b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer))[0] ?? null,
    [filtered],
  );

  const latestPrices = useMemo(() => {
    const result = new Map<string, FuelEntry>();
    for (const item of (entries ?? []).slice().sort((a, b) => b.entry_date.localeCompare(a.entry_date) || Number(b.odometer) - Number(a.odometer))) {
      if (!result.has(item.fuel_type)) result.set(item.fuel_type, item);
    }
    return result;
  }, [entries]);

  function openNewFuel(vehicleId?: string) {
    setEditingEntry(null);
    if (vehicleId) setVehicleFilter(vehicleId);
    setFuelDialog(true);
  }

  function openEntry(entry: FuelEntry) {
    setEditingEntry(entry);
    setVehicleFilter(entry.vehicle_id);
    setFuelDialog(true);
  }

  function exportFuelCsv() {
    const csv = fuelStatsCsv(perVehicle, { from, to });
    const suffix = from || to ? `${from || "inicio"}_${to || "hoje"}` : "geral";
    downloadCsv(csv, `combustivel-por-veiculo-${suffix}.csv`);
    toast.success("CSV exportado.");
  }

  async function handleDeleteVehicle(vehicle: Vehicle) {
    try {
      await deleteVehicle.mutateAsync(vehicle.id);
      if (vehicleFilter === vehicle.id) setVehicleFilter("all");
      setConfirmVehicle(null);
      toast.success("Veículo removido.");
    } catch (error) {
      console.error("[veiculos] falha ao remover", error);
      toast.error("Não foi possível remover o veículo.");
    }
  }

  async function handleDeleteEntry(entry: FuelEntry) {
    try {
      await deleteEntry.mutateAsync(entry);
      setConfirmEntry(null);
      toast.success("Abastecimento removido.");
    } catch (error) {
      console.error("[abastecimentos] falha ao remover", error);
      toast.error("Não foi possível remover o abastecimento.");
    }
  }

  return (
    <AppShell>
      <FeatureGate feature="vehicles">
        <div className="mx-auto max-w-6xl space-y-4">
          <section
            className="relative isolate overflow-hidden rounded-3xl border border-primary/20 bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-7"
            style={{
              backgroundImage:
                "radial-gradient(circle at 82% 25%, rgba(34,197,94,.30), transparent 25%), radial-gradient(circle at 65% 80%, rgba(59,130,246,.23), transparent 32%), linear-gradient(125deg, rgba(3,7,18,.98), rgba(15,23,42,.94) 56%, rgba(6,78,59,.90))",
            }}
          >
            <Fuel className="pointer-events-none absolute -right-5 -top-10 size-56 rotate-6 text-white/[0.06] sm:size-72" aria-hidden="true" />
            <Car className="pointer-events-none absolute bottom-0 right-24 hidden size-40 text-white/[0.045] lg:block" aria-hidden="true" />
            <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/15">Central de combustível</Badge>
                  {selectedVehicle ? <Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-100">{selectedVehicle.name}</Badge> : null}
                </div>
                <h1 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">Consumo, preço e custo real do seu veículo</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  O último preço é lembrado separadamente para gasolina comum, aditivada e etanol/álcool. Informe quanto pagou e o sistema calcula litros, km rodados e custo automaticamente.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => openNewFuel()} disabled={(vehicles ?? []).length === 0} className="bg-white text-slate-950 hover:bg-white/90">
                    <Plus className="mr-2 size-4" />Novo abastecimento
                  </Button>
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => { setEditingVehicle(null); setVehicleDialog(true); }}>
                    <Car className="mr-2 size-4" />Novo veículo
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                <HeroMetric label="Gasto" value={formatCurrency(summary.total)} />
                <HeroMetric label="Litros" value={`${summary.liters} L`} />
                <HeroMetric label="Média" value={summary.averageConsumption ? `${summary.averageConsumption} km/l` : "—"} />
                <HeroMetric label="Custo/km" value={summary.costPerKm ? formatCurrency(summary.costPerKm) : "—"} />
              </div>
            </div>
          </section>

          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (vehicles ?? []).length === 0 ? (
            <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <Car className="mx-auto size-9 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">Cadastre seu primeiro veículo</h2>
              <p className="mt-1 text-sm text-muted-foreground">Depois você poderá registrar abastecimentos e acompanhar o consumo automaticamente.</p>
              <Button className="mt-4" onClick={() => setVehicleDialog(true)}><Plus className="mr-2 size-4" />Adicionar veículo</Button>
            </section>
          ) : (
            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div><h2 className="text-sm font-semibold">Seus veículos</h2><p className="text-xs text-muted-foreground">Clique em um veículo para consultar somente os dados dele.</p></div>
                {vehicleFilter !== "all" ? <Button variant="ghost" size="sm" onClick={() => setVehicleFilter("all")}>Ver todos</Button> : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(vehicles ?? []).map((vehicle) => {
                  const selected = vehicleFilter === vehicle.id;
                  const vehicleStats = statsByVehicle([vehicle], entries ?? [])[0]?.summary;
                  return (
                    <article key={vehicle.id} className={`group rounded-2xl border bg-card p-3 transition-all ${selected ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/40"}`}>
                      <button type="button" onClick={() => setVehicleFilter(vehicle.id)} className="flex min-h-14 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl" aria-pressed={selected}>
                        <VehicleEmblem vehicleType={vehicle.vehicle_type} className="size-11 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2"><h3 className="truncate font-semibold">{vehicle.name}</h3><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></div>
                          <p className="truncate text-xs text-muted-foreground">{[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" · ") || labelFor(VEHICLE_TYPES, vehicle.vehicle_type)}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1"><Badge variant="secondary">{labelFor(FUEL_TYPES, vehicle.fuel_type)}</Badge>{vehicle.plate ? <Badge variant="outline">{vehicle.plate}</Badge> : null}{vehicleStats?.averageConsumption ? <Badge variant="outline">{vehicleStats.averageConsumption} km/l</Badge> : null}</div>
                        </div>
                      </button>
                      <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-1 border-t border-border/60 pt-2">
                        <Button size="sm" variant="secondary" onClick={() => openNewFuel(vehicle.id)}><Fuel className="mr-1.5 size-4" />Abastecer</Button>
                        <Button size="icon" variant="ghost" aria-label={`Editar ${vehicle.name}`} onClick={() => { setEditingVehicle(vehicle); setVehicleDialog(true); }}><Pencil className="size-4" /></Button>
                        <Button size="icon" variant="ghost" aria-label={`Excluir ${vehicle.name}`} onClick={() => setConfirmVehicle(vehicle)}><Trash2 className="size-4" /></Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="grid gap-2 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_auto]">
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger aria-label="Filtrar por veículo"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos os veículos</SelectItem>{(vehicles ?? []).map((vehicle) => <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={fuelFilter} onValueChange={setFuelFilter}>
                <SelectTrigger aria-label="Filtrar por combustível"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos os combustíveis</SelectItem>{FUEL_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.value === "etanol" ? "Etanol / Álcool" : item.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="Data inicial" />
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Data final" />
              <Button variant="outline" onClick={() => { setFrom(""); setTo(""); setFuelFilter("all"); }}>Limpar</Button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <InsightCard icon={Fuel} label="Preço médio" value={summary.averagePrice ? `${formatCurrency(summary.averagePrice)}/L` : "—"} hint={`${summary.entries} abastecimentos`} onClick={() => setFuelFilter("all")} />
            <InsightCard icon={Gauge} label="Consumo médio" value={summary.averageConsumption ? `${summary.averageConsumption} km/l` : "—"} hint={summary.cycles ? `${summary.cycles} ciclos completos` : "Aguardando ciclo completo"} onClick={() => selectedVehicle ? undefined : (vehicles?.[0] && setVehicleFilter(vehicles[0].id))} />
            <InsightCard icon={TrendingUp} label="Distância medida" value={`${summary.distance} km`} hint={summary.costPerKm ? `${formatCurrency(summary.costPerKm)}/km` : "Sem custo/km ainda"} onClick={() => selectedVehicle ? undefined : (vehicles?.[0] && setVehicleFilter(vehicles[0].id))} />
            <InsightCard icon={Droplets} label="Combustível" value={`${summary.liters} L`} hint={latestEntry ? `Último: ${formatDate(latestEntry.entry_date)}` : "Sem abastecimentos"} onClick={() => latestEntry && openEntry(latestEntry)} />
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Últimos preços lembrados</h2>
                <p className="mt-1 text-xs text-muted-foreground">O próximo abastecimento reutiliza automaticamente o último preço do combustível selecionado; você pode editar manualmente.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openNewFuel()} disabled={(vehicles ?? []).length === 0}><Plus className="mr-1.5 size-4" />Atualizar em novo abastecimento</Button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[{ key: "gasolina", label: "Gasolina comum" }, { key: "gasolina_aditivada", label: "Gasolina aditivada" }, { key: "etanol", label: "Etanol / Álcool" }].map((fuel) => {
                const item = latestPrices.get(fuel.key);
                return <button key={fuel.key} type="button" onClick={() => { setFuelFilter(fuel.key); if (item) openEntry(item); }} className="rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"><span className="text-xs text-muted-foreground">{fuel.label}</span><strong className="mt-1 block text-lg tabular-nums">{item ? `${formatCurrency(Number(item.price_per_liter))}/L` : "—"}</strong><span className="mt-1 block text-xs text-muted-foreground">{item ? `Salvo em ${formatDate(item.entry_date)}` : "Ainda não informado"}</span></button>;
              })}
            </div>
          </section>

          {vehicleFilter !== "all" ? (
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Evolução de {selectedVehicle?.name}</h2><p className="mt-1 text-xs text-muted-foreground">Comparação apenas entre ciclos completos para não distorcer o consumo.</p></div><Badge variant="outline">Tanque cheio → tanque cheio</Badge></div>
              <FuelCycleChart entries={entries ?? []} />
            </section>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div><h2 className="text-sm font-semibold">Histórico de abastecimentos</h2><p className="mt-0.5 text-xs text-muted-foreground">Clique em qualquer linha para consultar todos os detalhes.</p></div>
              <div className="flex gap-2"><Button variant="outline" size="sm" disabled={perVehicle.length === 0} onClick={exportFuelCsv}><Download className="mr-1.5 size-4" />CSV</Button><Button variant="outline" size="sm" asChild><Link to="/veiculos-auditoria"><History className="mr-1.5 size-4" />Logs</Link></Button><Button variant="outline" size="sm" asChild><Link to="/veiculos-configuracoes"><Settings2 className="mr-1.5 size-4" />Metas</Link></Button></div>
            </div>
            {loadingEntries ? (
              <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center"><ReceiptText className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">Nenhum abastecimento encontrado</p><p className="mt-1 text-xs text-muted-foreground">Registre um abastecimento ou ajuste os filtros.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Data / combustível</TableHead><TableHead className="hidden md:table-cell">Veículo</TableHead><TableHead className="text-right">Km</TableHead><TableHead className="text-right">Litros</TableHead><TableHead className="hidden sm:table-cell text-right">R$/L</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="hidden lg:table-cell text-right">Métrica</TableHead><TableHead className="w-24 text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.map((entry) => {
                      const distancePrevious = Number((entry as FuelEntry & { distance_since_previous?: number | null }).distance_since_previous ?? 0);
                      const fillMode = (entry as FuelEntry & { fill_mode?: string }).fill_mode;
                      return (
                        <TableRow key={entry.id} className="group cursor-pointer hover:bg-muted/40" onClick={() => openEntry(entry)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openEntry(entry); } }}>
                          <TableCell><div className="font-medium">{formatDate(entry.entry_date)}</div><div className="mt-0.5 text-xs text-muted-foreground">{entry.fuel_type === "etanol" ? "Etanol / Álcool" : labelFor(FUEL_TYPES, entry.fuel_type)} · {fillMode === "partial" ? "Parcial" : fillMode === "top_off" ? "Completou" : "Tanque cheio"}</div></TableCell>
                          <TableCell className="hidden md:table-cell font-medium">{(vehicles ?? []).find((vehicle) => vehicle.id === entry.vehicle_id)?.name ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums"><div>{entry.odometer}</div>{distancePrevious > 0 ? <div className="text-xs text-muted-foreground">+{distancePrevious} km</div> : null}</TableCell>
                          <TableCell className="text-right tabular-nums">{entry.liters} L</TableCell>
                          <TableCell className="hidden sm:table-cell text-right tabular-nums">{formatCurrency(Number(entry.price_per_liter))}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(Number(entry.total_amount ?? 0))}</TableCell>
                          <TableCell className="hidden lg:table-cell text-right">{entry.consumption ? <Badge variant="secondary">{entry.consumption} km/l</Badge> : <span className="text-xs text-muted-foreground">{entry.full_tank ? "Referência" : "Ciclo aberto"}</span>}</TableCell>
                          <TableCell className="text-right" onClick={(event) => event.stopPropagation()}><div className="flex justify-end gap-1">{entry.attachment_url ? <Button size="icon" variant="ghost" aria-label="Ver comprovante" onClick={() => setReceipt(entry.attachment_url)}><ReceiptText className="size-4" /></Button> : null}<Button size="icon" variant="ghost" aria-label="Editar abastecimento" onClick={() => openEntry(entry)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label="Excluir abastecimento" onClick={() => setConfirmEntry(entry)}><Trash2 className="size-4" /></Button></div></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>

        {vehicleDialog ? <VehicleDialog key={editingVehicle?.id ?? "new-vehicle"} open={vehicleDialog} onOpenChange={setVehicleDialog} vehicle={editingVehicle} /> : null}
        {fuelDialog ? <FuelDialog key={editingEntry?.id ?? "new-fuel"} open={fuelDialog} onOpenChange={setFuelDialog} vehicles={vehicles ?? []} defaultVehicleId={vehicleFilter === "all" ? undefined : vehicleFilter} entry={editingEntry} /> : null}
        <ReceiptViewer path={receipt} open={receipt !== null} onOpenChange={(value) => !value && setReceipt(null)} />

        <AlertDialog open={confirmVehicle !== null} onOpenChange={() => setConfirmVehicle(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover veículo?</AlertDialogTitle><AlertDialogDescription>O histórico de abastecimentos ligado a este veículo também será removido.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => confirmVehicle && handleDeleteVehicle(confirmVehicle)}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <AlertDialog open={confirmEntry !== null} onOpenChange={() => setConfirmEntry(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover abastecimento?</AlertDialogTitle><AlertDialogDescription>A despesa vinculada, se existir, também será excluída do histórico.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => confirmEntry && handleDeleteEntry(confirmEntry)}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </FeatureGate>
    </AppShell>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-28 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 backdrop-blur"><span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</span><strong className="mt-1 block text-base tabular-nums text-white">{value}</strong></div>;
}

function InsightCard({ icon: Icon, label, value, hint, onClick }: { icon: any; label: string; value: string; hint: string; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className="min-h-28 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><Icon className="size-4 text-primary" /></div><strong className="mt-2 block text-xl tabular-nums">{value}</strong><span className="mt-1 block text-xs text-muted-foreground">{hint}</span></button>;
}
