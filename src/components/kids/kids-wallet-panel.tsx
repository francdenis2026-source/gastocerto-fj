import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Baby, ChevronLeft, ChevronRight, Plus, RefreshCw, Search, Trash2, Wallet, UserCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getKidsWalletOverview, type KidWallet } from "@/lib/kids-wallet.functions";
import { formatCurrency } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CHART_TOKENS, tooltipProps } from "@/lib/chart-theme";

const PAGE_SIZE = 6;

type Props = {
  onCreate?: () => void;
  onRemove?: (dependentId: string) => void;
};

/** Painel compacto de acompanhamento em tempo real das carteiras dos filhos. */
export function KidsWalletPanel({ onCreate, onRemove }: Props) {
  const fetchOverview = useServerFn(getKidsWalletOverview);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["kids-wallet-overview"],
    queryFn: () => fetchOverview({ data: {} }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const channel = supabase
      .channel("kids-wallet-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["kids-wallet-overview"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const wallets = query.data?.wallets ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return wallets.filter((wallet) => {
      if (selected !== "all" && wallet.dependentId !== selected) return false;
      if (!term) return true;
      return `${wallet.name} ${wallet.nickname ?? ""}`.toLocaleLowerCase("pt-BR").includes(term);
    });
  }, [wallets, selected, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, w) => ({
          balance: acc.balance + w.balance,
          monthSpent: acc.monthSpent + w.monthSpent,
          monthReceived: acc.monthReceived + w.monthReceived,
        }),
        { balance: 0, monthSpent: 0, monthReceived: 0 }
      ),
    [filtered]
  );

  const alerts = useMemo(() => filtered.flatMap((wallet) => {
    const name = wallet.nickname?.trim() || wallet.name;
    const usage = wallet.monthlyLimit > 0 ? (wallet.monthSpent / wallet.monthlyLimit) * 100 : 0;
    const items: string[] = [];
    
    // Alerta de Saldo Zerado
    if (wallet.balance === 0) {
      items.push(`${name} está com saldo ZERADO!`);
    } 
    // Alerta de Saldo Baixo (abaixo de R$ 5,00)
    else if (wallet.balance < 5) {
      items.push(`${name} está com saldo muito baixo (${formatCurrency(wallet.balance)}).`);
    }
    
    if (usage >= 80) items.push(`${name} já utilizou ${Math.round(usage)}% do limite mensal.`);
    return items;
  }), [filtered]);

  const chartData = useMemo(() => filtered.map((wallet) => ({
    name: wallet.nickname?.trim() || wallet.name,
    gastos: wallet.monthSpent,
    limite: wallet.monthlyLimit,
  })), [filtered]);

  return (
    <section className="rounded-xl border bg-card p-2.5 sm:p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-primary/10">
            <Wallet className="size-3.5 sm:size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs sm:text-sm font-bold tracking-tight">Carteiras dos filhos</h2>
            <p className="truncate text-[9px] sm:text-[11px] text-muted-foreground font-medium">
              Saldo e gastos em tempo real
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Atualizar carteiras"
            onClick={() => void query.refetch()}
          >
            <RefreshCw className={cn("size-4", query.isFetching && "animate-spin")} />
          </Button>
          {onCreate ? (
            <Button size="sm" className="h-8 rounded-xl px-2.5 text-xs" onClick={onCreate}>
              <Plus className="mr-1 size-3.5" /> Filho
            </Button>
          ) : null}
        </div>
      </header>

      {wallets.length > 1 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Buscar filho..."
              className="h-9 pl-9 text-xs"
            />
          </div>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os filhos</SelectItem>
              {wallets.map((w) => (
                <SelectItem key={w.dependentId} value={w.dependentId}>
                  {w.nickname?.trim() || w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : wallets.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed p-5 text-center">
          <Baby className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium">Nenhum filho cadastrado</p>
          {onCreate ? (
            <Button size="sm" className="mt-2 h-8 rounded-xl text-xs" onClick={onCreate}>
              <Plus className="mr-1 size-3.5" /> Adicionar filho
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
            <Tile label="Em carteira" value={totals.balance} tone="balance" />
            <Tile label="Enviado no mês" value={totals.monthReceived} tone="in" />
            <Tile label="Gasto no mês" value={totals.monthSpent} tone="out" />
          </div>

          {alerts.length > 0 ? (
            <div className="mt-3 space-y-1.5" role="status" aria-label="Alertas das carteiras">
              {alerts.map((alert) => (
                <div key={alert} className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          ) : null}

          {chartData.length > 0 ? (
            <div className="mt-3 rounded-xl border bg-background/50 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold">Gastos e limite mensal</p>
                <span className="text-[10px] text-muted-foreground">Mês atual</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipProps} formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="gastos" name="Gastos" fill={CHART_TOKENS.expense} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="limite" name="Limite" fill={CHART_TOKENS.income} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {visible.map((wallet, idx) => (
              <WalletRow 
                key={wallet.dependentId} 
                wallet={wallet} 
                onRemove={onRemove} 
                index={idx}
                isSelected={selected === wallet.dependentId}
              />
            ))}
          </ul>
          {pages > 1 ? (
            <div className="mt-3 flex items-center justify-between border-t pt-2">
              <span className="text-[10px] text-muted-foreground">Página {Math.min(page, pages)} de {pages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="size-8" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" aria-label="Próxima página" disabled={page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "balance" | "in" | "out";
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-1.5 sm:p-2 flex flex-col justify-center min-h-[48px] sm:min-h-[56px]">
      <p className="truncate text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[11px] font-black tabular-nums leading-none sm:text-sm md:text-base",
          tone === "out" && "text-rose-600",
          tone === "in" && "text-emerald-600",
          tone === "balance" && (value < 0 ? "text-rose-600" : "text-foreground")
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function WalletRow({
  wallet,
  onRemove,
  index,
  isSelected,
}: {
  wallet: KidWallet;
  onRemove?: (dependentId: string) => void;
  index: number;
  isSelected?: boolean;
}) {
  const limit = wallet.monthlyLimit;
  const usage = limit > 0 ? Math.min(100, Math.round((wallet.monthSpent / limit) * 100)) : null;

  // Cores distintas para identificação visual por filho
  const childColors = [
    "border-l-brand",
    "border-l-blue-500",
    "border-l-purple-500",
    "border-l-amber-500",
    "border-l-rose-500",
    "border-l-cyan-500"
  ];
  const borderClass = childColors[index % childColors.length];

  return (
    <li className={cn(
      "rounded-xl border border-l-4 bg-background/50 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-brand/30 outline-none",
      borderClass,
      isSelected && "ring-2 ring-brand/20 bg-muted/30"
    )}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <div className={cn("size-8 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground", isSelected && "bg-brand/10 text-brand")}>
          <UserCircle className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{wallet.nickname?.trim() || wallet.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {wallet.hasAccess ? "Espaço Kids ativo" : "Sem acesso"}
            {wallet.monthlyAllowance > 0
              ? ` · mesada ${formatCurrency(wallet.monthlyAllowance)}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground">Carteira</p>
            <p
              className={cn(
                "text-sm font-black tabular-nums",
                wallet.balance < 0 ? "text-rose-600" : "text-emerald-600"
              )}
            >
              {formatCurrency(wallet.balance)}
            </p>
          </div>
          {onRemove ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-rose-600"
              aria-label={`Excluir ${wallet.nickname?.trim() || wallet.name}`}
              onClick={() => onRemove(wallet.dependentId)}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
        <span className="rounded-lg border px-2 py-1">
          Recebido <strong className="block tabular-nums">{formatCurrency(wallet.received)}</strong>
        </span>
        <span className="rounded-lg border px-2 py-1">
          Gasto <strong className="block tabular-nums">{formatCurrency(wallet.spent)}</strong>
        </span>
        <span className="rounded-lg border px-2 py-1">
          No mês <strong className="block tabular-nums">{formatCurrency(wallet.monthSpent)}</strong>
        </span>
      </div>

      {usage != null ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Limite do mês</span>
            <span className="tabular-nums">
              {usage}% de {formatCurrency(limit)}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                usage >= 100 ? "bg-rose-500" : usage >= 75 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${usage}%` }}
            />
          </div>
        </div>
      ) : (
        <Badge variant="outline" className="mt-2 text-[10px]">
          Sem limite definido
        </Badge>
      )}
    </li>
  );
}
