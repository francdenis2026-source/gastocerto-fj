import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Baby, Plus, RefreshCw, Trash2, Wallet } from "lucide-react";

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
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  onCreate?: () => void;
  onRemove?: (dependentId: string) => void;
};

/** Painel compacto de acompanhamento em tempo real das carteiras dos filhos. */
export function KidsWalletPanel({ onCreate, onRemove }: Props) {
  const fetchOverview = useServerFn(getKidsWalletOverview);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>("all");

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
  const visible = useMemo(
    () => (selected === "all" ? wallets : wallets.filter((w) => w.dependentId === selected)),
    [wallets, selected]
  );

  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, w) => ({
          balance: acc.balance + w.balance,
          monthSpent: acc.monthSpent + w.monthSpent,
          monthReceived: acc.monthReceived + w.monthReceived,
        }),
        { balance: 0, monthSpent: 0, monthReceived: 0 }
      ),
    [visible]
  );

  return (
    <section className="rounded-2xl border bg-card p-3 sm:p-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10">
            <Wallet className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">Carteiras dos filhos</h2>
            <p className="truncate text-[11px] text-muted-foreground">
              Saldo e gastos atualizados em tempo real
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
        <div className="mt-3">
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
              <Plus className="mr-1 size-3.5" /> Cadastrar filho
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Tile label="Em carteira" value={totals.balance} tone="balance" />
            <Tile label="Enviado no mês" value={totals.monthReceived} tone="in" />
            <Tile label="Gasto no mês" value={totals.monthSpent} tone="out" />
          </div>

          <ul className="mt-3 space-y-2">
            {visible.map((wallet) => (
              <WalletRow key={wallet.dependentId} wallet={wallet} onRemove={onRemove} />
            ))}
          </ul>
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
    <div className="rounded-xl border bg-background/60 p-2">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-black tabular-nums sm:text-base",
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
}: {
  wallet: KidWallet;
  onRemove?: (dependentId: string) => void;
}) {
  const limit = wallet.monthlyLimit;
  const usage = limit > 0 ? Math.min(100, Math.round((wallet.monthSpent / limit) * 100)) : null;

  return (
    <li className="rounded-xl border bg-background/50 p-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
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
